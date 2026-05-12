"use client";

import { FormEvent, useMemo, useState } from "react";
import AuthNavbar from "../components/auth-navbar";
import { getSupabaseClient } from "../../lib/supabase";
import { upsertProfileWithRetry } from "../../lib/profile-provisioning";

export default function CreatorSignup(){
const invite = useMemo(() => (typeof window === "undefined" ? null : new URLSearchParams(window.location.search).get("invite")), []);
const [form,setForm]=useState({fullName:"",professionalName:"",username:"",email:"",password:"",industry:"",bio:""}); const [status,setStatus]=useState("");
if(!invite) return <main className="premium-page"><AuthNavbar/><section className="premium-card"><p className="status-error">Missing invite code.</p></section></main>;
const submit=async(e:FormEvent)=>{e.preventDefault(); const supabase=getSupabaseClient(); const {data,error}=await supabase.auth.signUp({email:form.email,password:form.password,options:{data:{full_name:form.fullName,professional_name:form.professionalName,username:form.username,industry:form.industry,bio:form.bio,role:"verified_pending",is_approved:false,invited:true}}}); if(error){setStatus(error.message);return;} try { if (data.user?.id) { await upsertProfileWithRetry(supabase,{id:data.user.id,email:form.email,fullName:form.fullName,username:form.username,role:"verified_pending"}); } setStatus("Account created. Pending approval."); } catch { setStatus("Account created. We're still finishing setup — please sign in in a moment."); }};
return <main className="premium-page"><AuthNavbar/><section className="premium-card"><h1>Invite-only Creator Signup</h1><form className="premium-form" onSubmit={submit}><input required placeholder="Full name" value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})}/><input required placeholder="Brand/professional name" value={form.professionalName} onChange={(e)=>setForm({...form,professionalName:e.target.value})}/><input required placeholder="Username" value={form.username} onChange={(e)=>setForm({...form,username:e.target.value})}/><input required type="email" placeholder="Email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})}/><input required type="password" placeholder="Password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})}/><input required placeholder="Industry" value={form.industry} onChange={(e)=>setForm({...form,industry:e.target.value})}/><textarea required placeholder="Bio" value={form.bio} onChange={(e)=>setForm({...form,bio:e.target.value})}/><button className="gold-btn">Create Creator Account</button></form>{status&&<p className="muted">{status}</p>}</section></main>
}
