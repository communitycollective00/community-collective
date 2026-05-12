"use client";
import { FormEvent, useState } from "react";
import AuthNavbar from "../components/auth-navbar";
import { getSupabaseClient } from "../../lib/supabase";

const initial = { full_name:"", professional_name:"", username:"", email:"", phone:"", industry:"", city:"", state:"", website:"", social_links:"", credentials:"", featured_reason:"", services_offered:"" };
export default function ApplyPage(){
const [form,setForm]=useState(initial); const [status,setStatus]=useState("");
const submit=async(e:FormEvent)=>{e.preventDefault(); setStatus("Submitting application...");
const { error } = await (getSupabaseClient().from("profiles") as any).insert({ ...form, role:"pending_creator", is_approved:false, featured_requested:true, created_at:new Date().toISOString(), updated_at:new Date().toISOString() });
setStatus(error?error.message:"Application submitted."); if(!error) window.location.href="/pending-approval";};
return <main className="premium-page"><AuthNavbar/><section className="premium-card"><h1>Professional / Featured Application</h1><form onSubmit={submit} className="premium-form">{Object.entries(initial).map(([k])=><input key={k} required={!["website","social_links","phone"].includes(k)} placeholder={k.replace(/_/g," ")} value={(form as any)[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})} />)}<button className="gold-btn">Submit Application</button></form>{status&&<p className="muted">{status}</p>}</section></main>
}
