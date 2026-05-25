"use client";
import { FormEvent, useEffect, useState } from "react";
import AuthNavbar from "../components/auth-navbar";
import { getSupabaseClient } from "../../lib/supabase";
import { filterProfilePayload } from "../../lib/profile-fields";

const initial = { professional_name:"", phone:"", category:"", industry:"", city:"", state:"", location:"", website:"", credentials:"", featured_reason:"", description:"" };
export default function ApplyPage(){
const [form,setForm]=useState(initial); const [status,setStatus]=useState(""); const [userId,setUserId]=useState("");
useEffect(()=>{getSupabaseClient().auth.getSession().then(({data})=>{if(!data.session){window.location.href='/login';return;} setUserId(data.session.user.id);});},[]);
const submit=async(e:FormEvent)=>{e.preventDefault(); if(!userId) return; setStatus("Submitting application...");
const payload = filterProfilePayload({ id:userId, ...form, role:"professional_pending", featured_status:"requested", updated_at:new Date().toISOString() });
const { error } = await (getSupabaseClient().from("profiles") as any).upsert(payload,{onConflict:'id'});
setStatus(error?error.message:"Application submitted."); if(!error) window.location.href="/pending-approval";};
return <main className="premium-page"><AuthNavbar/><section className="premium-card"><h1>Apply to be a verified professional</h1><p className="muted">Submit your application to be reviewed for verified professional access.</p><form onSubmit={submit} className="premium-form">{Object.entries(initial).map(([k])=><input key={k} required={!['website','phone'].includes(k)} placeholder={k.replace(/_/g," ")} value={(form as any)[k] ?? ""} onChange={(e)=>setForm({...form,[k]:e.target.value})}/>) }<button className="gold-btn">Submit Application</button></form>{status&&<p className="muted">{status}</p>}</section></main>
}
