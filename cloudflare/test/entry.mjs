// TEST-ONLY entry (never copied by build.sh): same Worker, but Access is replaced by a fake that accepts one test token.
import {makeWorker} from './_real.js';
export default makeWorker({verify:async(t)=>t==='test-ok'?{email:'test@example.com'}:null});
