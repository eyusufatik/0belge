import requests
import json

ENDPOINT = 'https://www.turkiye.gov.tr'


def get_document(tc, barkod):
  # Create a session
  session = requests.Session()
  session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
      })
  session.base_uri = ENDPOINT
  session.timeout = 5
  response = session.get(ENDPOINT + '/belge-dogrulama')
  token = response.text.split('data-token="')[1].split('"')[0]
  print(token)
  # return token
  data = {
    'sorgulananBarkod': barkod,
    'token': token,
    'btn': 'Devam+Et'
  }
  response = session.post(ENDPOINT + '/belge-dogrulama&submit', data=data)
  token = response.text.split('data-token="')[1].split('"')[0]
  print(token)
  data = {
    'ikinciAlan': tc,
    'token': token,
    'btn': 'Devam+Et'
  }
  response = session.post(ENDPOINT + '/belge-dogrulama?islem=dogrulama&submit=', data=data)
  token = response.text.split('data-token="')[1].split('"')[0]
  print(token)
  data = {
    'chkOnay': '1',
    'token': token,
    'btn': 'Devam+Et'
  }
  response = session.post(ENDPOINT + '/belge-dogrulama?islem=onay&submit', data=data)
  token = response.text.split('data-token="')[1].split('"')[0]
  print(token)
  response = session.get(ENDPOINT + '/belge-dogrulama?belge=goster&goster=1&display=display')
  # Convert response data to pdf and save it
  with open('belge.pdf', 'wb') as f:
    f.write(response.content)

  # convert bytes to integer array
  data = [int(x) for x in response.content]
  # return len(data)
  # save to file
  with open("belgeler/" + tc + "_" + barkod + '.pdf', 'wb') as f:
    f.write(response.content)
  return len(response.content)


# def get_hex_from_bytes(data):
#     """Convert bytes to hex"""
#     return ''.join('{:02x}'.format(x) for x in data)

# def read_pdf(filename):
#     """Read pdf file and return bytes"""
#     with open(filename, 'rb') as f:
#         return get_hex_from_bytes(f.read())

# if __name__ == '__main__':
#   # print(len(read_pdf('belge.pdf')))
#   token = get_document('10089028918', 'YOKOG18C83NE4FJAGW')
#   print(token)

# create flask api
from flask import Flask, request, jsonify, send_file, make_response
from flask_cors import CORS

import os
app = Flask(__name__)
CORS(app)


@app.route('/get_document', methods=['GET'])
def edevlet():
  tc = str(request.args.get('tc'))
  barkod = str(request.args.get('barkod'))
  if not os.path.isfile("belgeler/" + tc + "_" + barkod + '.pdf'):
    get_document(tc, barkod)
  return send_file("belgeler/" + tc + '_' + barkod + '.pdf', as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)