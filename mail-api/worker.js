// Cloudflare Worker: independent mail delivery endpoint.
// Configure RESEND_API_KEY and FROM_EMAIL as Worker secrets/settings.
// Set ALLOWED_ORIGIN to https://bunpuku-hitone.github.io
// Set TURNSTILE_SECRET as a Worker secret and provide Turnstile token from the app.
// Never put the Resend API key in GitHub Pages.
const json=(body,status=200,origin='')=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':origin,'Vary':'Origin','Cache-Control':'no-store'}});
export default {async fetch(request,env){
  const origin=request.headers.get('Origin')||'';
  const allowed=env.ALLOWED_ORIGIN||'https://bunpuku-hitone.github.io';
  if(origin!==allowed)return json({error:'Origin not allowed'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
  if(request.method!=='POST')return json({error:'Method not allowed'},405,allowed);
  if(!env.RESEND_API_KEY||!env.FROM_EMAIL||!env.TURNSTILE_SECRET)return json({error:'Mail service is not configured'},503,allowed);
  let data;try{data=await request.json()}catch{return json({error:'Invalid JSON'},400,allowed)}
  const {to,subject,text,turnstileToken}=data||{};
  if(typeof to!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||to.length>254||typeof subject!=='string'||subject.length>200||typeof text!=='string'||!text.trim()||text.length>100000||typeof turnstileToken!=='string')return json({error:'Invalid input'},400,allowed);
  const verify=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:turnstileToken,remoteip:request.headers.get('CF-Connecting-IP')||''})});
  if(!verify.ok||(await verify.json()).success!==true)return json({error:'Verification failed'},403,allowed);
  const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:env.FROM_EMAIL,to:[to],subject,text})});
  if(!result.ok)return json({error:'Mail provider rejected the request'},502,allowed);
  return json({ok:true},200,allowed);
}};