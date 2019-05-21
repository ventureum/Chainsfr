const {google} = require('googleapis')

const oauth2Client = new google.auth.OAuth2(
  '754636752811-j7123ts13jt3mnjt9bgee7101jq4ndfu.apps.googleusercontent.com',
  'KLYZ_8eBgwlCatJHHStRCFeV',
  'https://tim.serveo.ventureum.io'
)

oauth2Client.getTokenInfo(
    'ya29.Gl0QB049v1W7k76codKb-OdLR9gRYOECN4qvZAmusLtWEiPabfotPEIQcod-iv47si3a2N_jmKVdWL-iEq4kVenl3f6QS-YUGVjgZqwfOcLWHoq0hEF15mFwEkiP4Bw'
).then(tokenInfo => console.log(tokenInfo))