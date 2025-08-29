# AI-Powered Resume Screener + Smart Candidate Search

## 📌 Problem

Recruiters face two challenges:

1. **Resume Screening** — finding out if a candidate fits a specific JD.
2. **Talent Search** — quickly identifying the right candidate from a large pool of resumes based on required skills/experience.

Manually doing both is slow, inconsistent, and often misses strong candidates.

---

## 💡 Solution (MVP)

The **AI-Powered Resume Screener** automates resume evaluation **and** adds a **searchable talent database**:

1. **Resume Screening**

   * Upload resume + JD → System provides a match score, missing skills, and strengths.

2. **Recruiter Search** *(New Feature)*

   * After uploading multiple resumes, recruiters can simply **search for skills (e.g., React + Spring Boot + Microservices)**.
   * The system instantly returns the **best-matching candidates** from the resume pool.
   * Results ranked by AI-based scoring and keyword matching.

This helps recruiters both **screen one-to-one** and **search one-to-many**, making it a lightweight, intelligent ATS.

---

## ⚙️ MVP Features

* **Resume Upload (PDF/DOCX)** → Extracts structured text.
* **Job Description Input + Screening** → AI-powered match score, missing skills, and strengths.
* **Recruiter Search** → Skill-based search across all uploaded resumes, with ranking.
* **Results Dashboard** → Visual insights (match %, skill gaps, candidate highlights).
* *(Optional)* Tailored resume summary per candidate for quick decision making.

---

## 🛠️ Tech Stack

* **Frontend**: React
* **Backend**: Node.js + Express
* **Parsing**: `pdf-parse`, `docx`
* **AI Integration**: GPT (semantic match, summaries)
* **Search/Indexing**: MongoDB full-text search OR ElasticSearch (if ambitious)
* **NLP/Keyword Extraction**: `natural`, `compromise`

---

## 🎯 Impact

* Cuts down resume shortlisting time by **70%**.
* Enables recruiters to **instantly search** for the right talent across hundreds of resumes.
* Ensures **data-driven, consistent hiring decisions**.
