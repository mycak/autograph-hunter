"""Merge a browser-reviewed report without requiring marketplace API credentials."""
import argparse
import json
from pathlib import Path
import subprocess
from urllib.parse import urlparse
from refresh import ROOT, DATA, merge, stamp

def import_report(report_path, data_path=DATA):
    subprocess.run(['node',str(ROOT/'scripts/validate.mjs'),str(report_path)],check=True)
    report=json.loads(Path(report_path).read_text())
    for offer in report['offers']:
        proof=offer.get('signatureEvidence',{})
        if offer.get('active',True) and (not isinstance(proof,dict) or proof.get('visibleSignature') is not True or urlparse(proof.get('imageUrl','')).scheme!='https' or not proof.get('note')):
            raise ValueError('Active agent offers require signatureEvidence: visibleSignature=true, imageUrl and a note describing the visible signature. Title or patch alone is insufficient: '+offer['id'])
    data=json.loads(data_path.read_text())
    now=stamp()
    data['offers']=merge(data['offers'],report['offers'],now)
    data['updatedAt']=now
    for source in data['sources']:
        matching=[o for o in report['offers'] if o['source']==source['name']]
        if matching:
            source['agent']={'checkedAt':max(o['lastSeen'] for o in matching),'offers':len(matching),
                             'message':'Skan agentowy bez API: ceny i dostawa odczytane z konkretnych ogłoszeń. Dowody autentyczności wymagają oddzielnej kontroli.'}
            if source['status']=='agent_scheduled':
                source['status']='agent_checked'
                source['message']=source['message'].replace(' Pierwszy skan jeszcze nie został wykonany.','')
    temp=data_path.with_suffix('.tmp')
    temp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    temp.replace(data_path)
    print('Imported browser-reviewed offers:',len(report['offers']))

if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('report',type=Path)
    args=parser.parse_args()
    import_report(args.report)
