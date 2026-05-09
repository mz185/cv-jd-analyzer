"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface AnalysisResult {
  skill_gaps: string[];
  interview_questions: string[];
  talking_points: string[];
}

export default function Home() {
  const [jdText, setJdText] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!jdText || !cvFile) {
      setError("Please provide both a job description and a CV.");
      return;
    }
    setError("");
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("jd_text", jdText);
    formData.append("cv_file", cvFile);

    try {
      const res = await fetch(`${API_URL}/analyse`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Is the backend running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-2">CV · JD Analyser</h1>
      <p className="text-gray-500 mb-10">Upload your CV and paste a job description to get a gap analysis, likely interview questions, and talking points.</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Job Description</label>
          <textarea
            className="w-full border rounded-lg p-3 text-sm h-40 resize-none focus:outline-none focus:ring-2 focus:ring-black"
            placeholder="Paste the job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Your CV (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            className="text-sm"
            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 transition"
        >
          {loading ? "Analysing..." : "Analyse"}
        </button>
      </div>

      {result && (
        <div className="mt-16 space-y-10">
          <Section title="Skill Gaps" items={result.skill_gaps} />
          <Section title="Likely Interview Questions" items={result.interview_questions} />
          <Section title="Talking Points" items={result.talking_points} />
        </div>
      )}
    </main>
  );
}

function Section({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={`${title}-${i}`} className="flex gap-3 text-sm text-gray-700">
            <span className="mt-0.5 text-gray-300">—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}