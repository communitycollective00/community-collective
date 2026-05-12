"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabase";
import { useAdminGuard } from "../../components/admin-guard";

export default function AdminApplications(){
const {loading,error,isAdmin}=useAdminGuard("/admin/applications");
const [apps,setApps]=useState<any[]>([]);
const [status,setStatus]=useState("");
useEffect(()=>{if(!isAdmin) return; (async()=>{const {data}=await (getSupabaseClient().from("profiles") as any).select("id,full_name,email,role,industry,featured_requested").in("role",["pending_creator","verified_pending"]).order("created_at",{ascending:false}); setApps(data||[]);})();},[isAdmin]);
const act=async(id:string,action:"approve"|"decline"|"feature")=>{const patch=action==="approve"?{role:"verified",is_approved:true}:action==="feature"?{role:"featured",is_approved:true,featured:true}:{role:"member",is_approved:false,featured:false}; const {error}=await (getSupabaseClient().from("profiles") as any).update(patch).eq("id",id); setStatus(error?error.message:`${action}d`); setApps(apps.filter(a=>a.id!==id));};
if(loading) return <main className="premium-page"><section className="premium-card"><p>Loading...</p></section></main>;
if(error||!isAdmin) return <main className="premium-page"><section className="premium-card"><p className="status-error">Admin only.</p></section></main>;
return <main className="premium-page"><section className="premium-card admin-card"><h1>Applications</h1>{status&&<p className="muted">{status}</p>}<div className="submissions-list">{apps.map((a)=><article key={a.id} className="submission-item"><h3>{a.full_name}</h3><p className="muted">{a.email} • {a.industry} • {a.role}</p><div className="quick-links"><button className="gold-btn" onClick={()=>act(a.id,"approve")}>Approve</button><button className="gold-btn" onClick={()=>act(a.id,"feature")}>Feature</button><button className="gold-btn" onClick={()=>act(a.id,"decline")}>Decline</button></div></article>)}</div></section></main>
}
