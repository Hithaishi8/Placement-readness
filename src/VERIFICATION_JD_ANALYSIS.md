# JD Analysis — Verification Steps

## 1) Confirm skill extraction

- Go to **Dashboard → Analyze JD**.
- Paste the sample JD below (or any JD containing keywords like React, DSA, SQL).
- Click **Analyze**.
- On **Results** you should see:
  - **Key skills extracted**: Tags grouped by category (e.g. Core CS, Web, Data).
  - If the JD contains **none** of the defined keywords, you should see a single tag: **General fresher stack**.

## 2) Confirm history persists after refresh

- After running an analysis, go to **Dashboard → History**.
- You should see an entry with date, company, role, and readiness score.
- **Refresh the page (F5)**. The same entry should still be there.
- Click the entry. You should land on **Results** with that analysis (same score and content).

## 3) Sample JD to verify (copy-paste)

```
We are hiring a Full Stack Developer (SDE 1).

Requirements:
- Strong in Data Structures and Algorithms (DSA).
- Experience with React and Node.js. Next.js is a plus.
- Proficient in SQL and MongoDB. PostgreSQL or MySQL preferred.
- Knowledge of AWS, Docker, and CI/CD is desirable.
- Programming: Java or Python. Good understanding of OOP and DBMS.
- OS and Computer Networks basics required.

Role: SDE 1
Company: TechCorp
```

Expected:
- **Key skills**: Tags from Core CS (DSA, OOP, DBMS, OS, Networks), Languages (Java, Python), Web (React, Node.js, Next.js, Express), Data (SQL, MongoDB, PostgreSQL, MySQL), Cloud/DevOps (AWS, Docker, CI/CD).
- **Readiness score**: 35 + (5×6 categories) + 10 (company) + 10 (role) + 10 (JD length > 800) = 95 (capped at 100).
- **Round-wise checklist** and **7-day plan** should include DSA, React, SQL, and project/resume items.
- **10 likely questions** should include at least one each for SQL, React, DSA, and OOP/language.

All logic runs in the browser. No external APIs. Data is stored only in localStorage.
