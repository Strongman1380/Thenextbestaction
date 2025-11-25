'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import CaseInputForm, { type FormData } from '@/components/CaseInputForm';
import CasePlanCard from '@/components/CasePlanCard';
import SkillBuildingForm, { type SkillBuildingData } from '@/components/SkillBuildingForm';
import SkillResourceCard from '@/components/SkillResourceCard';
import Header from '@/components/Header';
import CompassionFooter from '@/components/CompassionFooter';
import HowToUse from '@/components/HowToUse';
import type { Session } from '@supabase/auth-helpers-nextjs';

type TabType = 'case-plan' | 'skill-building' | 'client-resources';

export default function CaseManagementClient({ session }: { session: Session | null }) {

  const [activeTab, setActiveTab] = useState<TabType>('case-plan');

  // Case Plan State
  const [casePlan, setCasePlan] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string>('medium');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [lastActivity, setLastActivity] = useState('No activity yet');

  // Skill Building State (for workers)
  const [skillResource, setSkillResource] = useState<string | null>(null);
  const [skillTopic, setSkillTopic] = useState<string>('');
  const [skillLoading, setSkillLoading] = useState(false);
  const [skillError, setSkillError] = useState<string | null>(null);
  
  // Storing form data for regeneration
  const [lastSkillData, setLastSkillData] = useState<SkillBuildingData | null>(null);


  // Client Resources State (for clients)
  const [clientResource, setClientResource] = useState<string | null>(null);
  const [clientTopic, setClientTopic] = useState<string>('');
  const [clientLoading, setClientLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  
  // Storing form data for regeneration
  const [lastClientData, setLastClientData] = useState<SkillBuildingData | null>(null);


  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    if (!session?.user) {
      setError('You must be logged in to create a case plan.');
      setLoading(false);
      return;
    }

    try {
        // Generate the AI case plan via the API
        const response = await fetch('/api/generate-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to generate case plan');
        }

        // Save the case plan to the database
        const { error: dbError } = await supabase
          .from('case_plans')
          .insert({
            content: data.case_plan,
            primary_need: formData.primary_need,
            urgency: formData.urgency,
            caseworker_id: session.user.id,
            input_data: formData,
            status: 'Not Started',
          });

        if (dbError) {
          console.error('Failed to save case plan to database:', dbError);
          // Continue anyway - show the plan even if save fails
        }

        setCasePlan(data.case_plan);
        setUrgency(formData.urgency);
        setLastActivity(`Case plan generated • ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);

    } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
    } finally {
        setLoading(false);
    }
  };

  const handleNewCase = () => {
    setCasePlan(null);
    setError(null);
    setLastActivity('Preparing a new case plan');
  };

  const handleSkillSubmit = async (formData: SkillBuildingData) => {
    setSkillLoading(true);
    setSkillError(null);
    setLastSkillData(formData); // Save for regeneration

    try {
      const response = await fetch('/api/generate-skill-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Save to database if user is logged in
        if (session?.user) {
          const { error: dbError } = await supabase
            .from('saved_resources')
            .insert({
              content: data.skill_resource,
              topic: formData.skill_topic,
              resource_type: formData.resource_type,
              caseworker_id: session.user.id,
              category: 'skill-building',
            });

          if (dbError) {
            console.error('Failed to save skill resource:', dbError);
          }
        }

        setSkillResource(data.skill_resource);
        setSkillTopic(formData.skill_topic);
        setLastActivity(`Skill resource generated • ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
      } else {
        setSkillError(data.error || 'Failed to generate skill building resource');
      }
    } catch (err: any) {
      setSkillError(err.message || 'Network error occurred');
    } finally {
      setSkillLoading(false);
    }
  };

  const handleNewSkillResource = () => {
    setSkillResource(null);
    setSkillError(null);
    setLastActivity('Preparing a new skill resource');
  };
  
  const handleRegenerateSkillResource = () => {
    if (lastSkillData) {
      handleSkillSubmit(lastSkillData);
    }
  };

  const handleClientResourceSubmit = async (formData: SkillBuildingData) => {
    setClientLoading(true);
    setClientError(null);
    setLastClientData(formData); // Save for regeneration

    try {
      const response = await fetch('/api/generate-client-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Save to database if user is logged in
        if (session?.user) {
          const { error: dbError } = await supabase
            .from('saved_resources')
            .insert({
              content: data.client_resource,
              topic: formData.skill_topic,
              resource_type: formData.resource_type,
              caseworker_id: session.user.id,
              category: 'client-resource',
            });

          if (dbError) {
            console.error('Failed to save client resource:', dbError);
          }
        }

        setClientResource(data.client_resource);
        setClientTopic(formData.skill_topic);
        setLastActivity(`Client resource generated • ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`);
      } else {
        setClientError(data.error || 'Failed to generate client resource');
      }
    } catch (err: any) {
      setClientError(err.message || 'Network error occurred');
    } finally {
      setClientLoading(false);
    }
  };

  const handleNewClientResource = () => {
    setClientResource(null);
    setClientError(null);
    setLastActivity('Preparing a new client resource');
  };

  const handleRegenerateClientResource = () => {
    if(lastClientData) {
        handleClientResourceSubmit(lastClientData);
    }
  };

  return (
    <main className="min-h-screen px-4 py-6 md:px-6 md:py-8 lg:px-10">
      <Header />

      {/* The rest of your JSX from app/page.tsx goes here */}
      {/* ... (Copy the entire <section> ... </section> and below) ... */}
      <section className="grid gap-6 lg:grid-cols-[2fr,1fr] mb-6">
        <div className="card space-y-6">
          <div className="flex flex-col gap-5">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Case Management Console</p>
              <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900">
                Coordinate trauma-informed care with clarity
              </h2>
              <p className="text-sm text-slate-500">
                Capture needs, generate plans, and land on skill-building resources—all within a structured, professional workspace.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="panel">
              <span className="panel-header">Active tab</span>
              <span className="panel-value">
                {activeTab === 'case-plan' ? 'Case plan' : activeTab === 'skill-building' ? 'Skill building' : 'Client resources'}
              </span>
              <p className="text-sm text-slate-500">
                Switch between case planning, worker development, and client self-help tools.
              </p>
            </div>
            <div className="panel">
              <span className="panel-header">Last activity</span>
              <span className="panel-value">{lastActivity}</span>
              <p className="text-sm text-slate-500">
                Updated each time AI responds to your prompts.
              </p>
            </div>
            <div className="panel">
              <span className="panel-header">AI confidence</span>
              <span className="panel-value">92%</span>
              <p className="text-sm text-slate-500">
                Higher scores when details, context, and urgency are clear.
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Workflow status</p>
              <h3 className="text-xl font-semibold text-slate-900">Ready for next steps</h3>
            </div>
            <span className="rounded-full px-4 py-1.5 text-xs font-semibold bg-primary/10 text-primary">
              Today
            </span>
          </div>

          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
              Intake prompts queued
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-secondary"></span>
              Skill resources ready for coaching
            </li>
            <li className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-info"></span>
              Notifications: 0 overdue
            </li>
          </ul>
        </div>
      </section>

      <section className="card space-y-6">
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Case management workspace</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              Next best action, ready in minutes
            </h3>
            <p className="text-sm text-slate-500 max-w-xl">
              Provide structured inputs and let AI craft a plan or professional development resource that aligns with your client’s needs.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveTab('case-plan')}
            className={activeTab === 'case-plan' ? 'btn-primary' : 'btn-outline'}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M9 8h4" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4z" />
              </svg>
              Case Plan
            </div>
          </button>
          <button
            onClick={() => setActiveTab('skill-building')}
            className={activeTab === 'skill-building' ? 'btn-primary' : 'btn-outline'}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l6 6" />
              </svg>
              Worker Skills
            </div>
          </button>
          <button
            onClick={() => setActiveTab('client-resources')}
            className={activeTab === 'client-resources' ? 'btn-primary' : 'btn-outline'}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Client Resources
            </div>
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4 sm:p-6">
          {activeTab === 'case-plan' && (
            <>
              {!casePlan ? (
                <div className="card animate-fade-in space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      Case information
                    </h2>
                    <p className="text-sm text-slate-500">
                      Provide details about your client's situation, and let AI surface the next stabilization steps and referrals.
                    </p>
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
                      <p className="text-red-700 font-semibold">Error</p>
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <CaseInputForm onSubmit={handleSubmit} loading={loading} />
                  <HowToUse
                    title="How to Use the Case Plan Generator"
                    content={
                      <>
                        <p><strong>1. Describe the Primary Need:</strong> Enter the main reason for the case plan. Be as specific as possible.</p>
                        <p><strong>2. Set the Urgency Level:</strong> Select from Low, Medium, or High to prioritize the case.</p>
                        <p><strong>3. Add Optional Details:</strong> Include client initials, your name, and a ZIP code for localized resources.</p>
                        <p><strong>4. Provide Additional Context:</strong> Use the text area to add any other relevant information.</p>
                        <p><strong>5. Generate Plan:</strong> Click "Generate Next Best Action" to create the case plan.</p>
                      </>
                    }
                  />
                </div>
              ) : (
                <CasePlanCard
                  casePlan={casePlan}
                  urgency={urgency}
                  onNewCase={handleNewCase}
                />
              )}
            </>
          )}

          {activeTab === 'skill-building' && (
            <>
              {!skillResource ? (
                <div className="card animate-fade-in space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      Professional development & skill building
                    </h2>
                    <p className="text-sm text-slate-500">
                      Describe a challenge or strength you'd like to build; AI will craft bespoke worksheets, readings, or coaching prompts for workers.
                    </p>
                  </div>

                  {skillError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
                      <p className="text-red-700 font-semibold">Error</p>
                      <p className="text-sm text-red-600">{skillError}</p>
                    </div>
                  )}

                  <SkillBuildingForm onSubmit={handleSkillSubmit} loading={skillLoading} />
                   <HowToUse
                    title="How to Use the Skill Building Generator"
                    content={
                      <>
                        <p><strong>1. Identify the Skill or Challenge:</strong> Enter the topic you want to focus on.</p>
                        <p><strong>2. Add Your Name (Optional):</strong> Personalize the resource by adding your name.</p>
                        <p><strong>3. Choose a Resource Type:</strong> Select your preferred format (worksheet, reading, etc.).</p>
                        <p><strong>4. Provide Context:</strong> Describe the situation or challenges you're facing.</p>
                        <p><strong>5. Generate Resource:</strong> Click "Generate Skill Building Resources" to create the material.</p>
                      </>
                    }
                  />
                </div>
              ) : (
                <SkillResourceCard
                  skillResource={skillResource}
                  skillTopic={skillTopic}
                  onRegenerate={handleRegenerateSkillResource}
                  onCreateNew={handleNewSkillResource}
                />
              )}
            </>
          )}

          {activeTab === 'client-resources' && (
            <>
              {!clientResource ? (
                <div className="card animate-fade-in space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-semibold text-slate-900">
                      Client self-help resources
                    </h2>
                    <p className="text-sm text-slate-500">
                      Describe what the client is working on; AI will create self-help worksheets, exercises, and resources specifically for the client to use independently.
                    </p>
                  </div>

                  {clientError && (
                    <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4">
                      <p className="text-red-700 font-semibold">Error</p>
                      <p className="text-sm text-red-600">{clientError}</p>
                    </div>
                  )}

                  <SkillBuildingForm onSubmit={handleClientResourceSubmit} loading={clientLoading} />
                   <HowToUse
                    title="How to Use the Client Resource Generator"
                    content={
                      <>
                        <p><strong>1. Identify the Client's Goal:</strong> Enter the topic the client is working on.</p>
                        <p><strong>2. Choose a Resource Type:</strong> Select the best format for the client.</p>
                        <p><strong>3. Provide Context:</strong> Describe the client's situation and needs.</p>
                        <p><strong>4. Generate Resource:</strong> Click "Generate Skill Building Resources" to create a self-help tool for your client.</p>
                      </>
                    }
                  />
                </div>
              ) : (
                <SkillResourceCard
                  skillResource={clientResource}
                  skillTopic={clientTopic}
                  onRegenerate={handleRegenerateClientResource}
                  onCreateNew={handleNewClientResource}
                />
              )}
            </>
          )}
        </div>
      </section>
      <CompassionFooter />
    </main>
  );
}
