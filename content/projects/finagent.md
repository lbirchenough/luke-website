# Financial Research Agent

<div class="my-6 rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-gray-200">
  <strong class="text-amber-300">Update:</strong> Due to significant fees, agentic retrieval on the Foundry IQ knowledge base has been set from medium to minimal reasoning. Knowledge sources are now queried directly rather than through a planning agent. <a href="#retrieval-rag">Details in the Retrieval (RAG) section</a>.
</div>

## Overview

A financial analysis chat app. Ask it about Amazon or Meta and it answers from their SEC filings, retrieving against a corpus of 10-Ks and 10-Qs, with an MCP tool server covering anything the filings can't: current stock price, the latest earnings release, live SEC company facts. The same question can be put to two separate pipelines. One is hand-rolled with LangChain and deepagents over a Qdrant vector store I built and ingest into myself. The other runs entirely on Azure AI Foundry Agent Service, where the agent, its knowledge base and its conversation history are all hosted. Both sit behind the same React frontend. Because a chat model on the open internet is a spending liability, cost control and abuse control are treated as first-class requirements rather than afterthoughts.

## Showcase

See the [Live App](https://agent.lbirchen.com/). The same UI serves two chat pages, `/foundry` (managed) and `/langchain` (self-hosted), so the two runtimes can be asked the same question side by side.

The corpus is Amazon and Meta SEC filings: 10-Ks for 2023, 2024 and 2025 plus the Q1 2026 10-Q. Live and most-recent data (stock price, latest earnings) comes from an MCP tool server rather than the filings.

**A global rate limit of 6 turns per minute applies across all visitors, not per session.** This is a deliberate spending cap, so a busy moment may mean a short wait. See Cost Mitigations below for why it is global.

## Tech Stack

- **Frontend:** React, TypeScript, Vite, assistant-ui, deployed to Cloudflare Pages
- **Backend:** FastAPI on Azure Container Apps, one server-sent-event streaming endpoint per runtime
- **Agent (self-hosted):** LangChain + deepagents, LangGraph orchestrator with an isolated research sub-agent
- **Agent (managed):** Azure AI Foundry Agent Service on the OpenAI Responses protocol
- **Vector Store:** Qdrant Cloud (named dense + sparse vectors, hybrid retrieval)
- **Embeddings:** text-embedding-3-small (1536-dim, cosine) alongside BM25
- **Conversation State:** Neon Postgres (LangGraph checkpoints), Foundry-hosted conversations
- **Document Store:** Azure Blob Storage (source PDFs behind the Foundry Knowledge Source)
- **Ingestion:** docling PDF extraction, gpt-5.2 vision model for chart and figure descriptions
- **Tools:** Remote MCP server on Azure Functions: stock price, latest earnings 8-K, SEC company facts, ratio calculator
- **Evaluation:** Azure AI Foundry Evaluations: relevance, groundedness, similarity, fluency, coherence, tool selection, response completeness
- **Edge & Security:** Cloudflare Pages Functions proxy, Cloudflare Turnstile, CSP headers, signed session cookies
- **Cost Control:** Azure API Management AI Gateway token quota, global application rate limit, provider-level spend cap
- **Identity:** DefaultAzureCredential, managed identity when deployed and az login locally, no Azure API keys

## Motivations

- Deploy a chat agent publicly, rather than run one on my own machine, and find out what that actually involves.
- Build a **RAG pipeline** end to end: PDF extraction, chunking, embedding, and retrieval over a real document corpus.
- Build an **MCP server** and attach it as agent tooling, so the agent can reach live data the corpus can't cover.
- I had been exposed to LangChain first via online courses, and this was a good opportunity to reinforce some of those learnings while getting a direct comparison against a more managed cloud service. Foundry Agent Service is that comparison: same corpus, same task, one built in code and one configured in a portal.
- Use Foundry's Evaluations tooling to pick a model on measured scores rather than reputation.
- Keep it cheap. A chat model on the open internet is a spending liability, so cost and abuse control are part of the build, not an afterthought.

## Architecture

- **Frontend:** Vite + React SPA (assistant-ui `Thread`), deployed to Cloudflare Pages. One UI, two chat pages (`/langchain`, `/foundry`), one runtime adapter (`frontend/src/runtime.ts`).
- **Backend:** FastAPI on Azure Container Apps, one streaming endpoint per runtime. Both emit **server-sent events**, which is what keeps the frontend adapter a single implementation.
- **Proxy hop:** a Cloudflare Pages Function (`frontend/functions/api/[[path]].ts`) sits between the two, so the browser only ever talks to one origin.
- **State:** a signed session cookie carries the LangChain `thread_id` and the Foundry `conversation_id`. Neither id is client-supplied; the browser cannot name or read the key its history is stored under.
- **Stores:** Qdrant Cloud (vectors, LangChain side), Neon Postgres (LangGraph checkpoints), Azure Blob Storage (source PDFs, Foundry side).
- **Tools:** a remote MCP server on Azure Functions (`mcp/`) exposing live and most-recent financial data. Stock price, latest earnings 8-K, SEC company facts, ratio calculator. Attached to both runtimes, and the thing that lets either agent answer beyond the static corpus.

![System architecture](https://res.cloudinary.com/duevte0ku/image/upload/v1786026457/system-architecture_a4tsmb.png)

## Agent Frameworks

### LangChain / deepagents (self-hosted)

- Agent is **code**: `backend/langchain_deep_agent/agent.py` assembles it per request.
- **Orchestrator + sub-agent split.** The orchestrator has *no tools of its own* and must delegate; its only job is to read what kind of answer the request wants, a figure or a report, and brief the researcher accordingly.
- The **research sub-agent** owns the whole toolset (`get_corpus_manifest`, `hybrid_search`, `think_tool`, plus the MCP tools) and runs in an isolated context, so retrieval noise never lands in the orchestrator's window.
- Middleware comes from the `deepagents` default stack: todo list, filesystem, and `SummarizationMiddleware` to bound the prompt.
- **History** is a LangGraph Postgres checkpoint in Neon, keyed by `thread_id`, opened and closed per request.
- Everything is a knob: model, recursion limit, output-token ceiling, timeout, retrieval `k`, truncation caps. All in `config.py`, all enforced in code.

### Azure AI Foundry Agent Service (managed)

- Agent is **configuration**, defined in the Foundry portal: model deployment, system prompt, knowledge base, tools. The app references it **by name** (`AZURE_AI_AGENT_NAME`) and nothing else.
- Runs on the OpenAI **Responses** protocol; Foundry holds the conversation server-side and truncates it server-side too.
- Model deployments are provisioned in Foundry, which is what makes the model swap in the evaluations a portal change rather than a code change.
- Tools (including the same remote MCP server) and the knowledge base are **connected** to the agent in the portal.
- No orchestrator/sub-agent split to build, since the service does the tool loop. The flip side is that a hosted agent exposes no tool activity, so there is nothing to stream to the UI but the reply text.
- Auth is `DefaultAzureCredential`: `az login` locally, managed identity when deployed. No API key anywhere.
- Pointing the app at a different agent is one env var plus a restart; the name is read in exactly one place (`backend/app/foundry.py`).

**A note on models:** the two runtimes are deliberately not on the same model. The Foundry agent runs GPT-5.4-Nano, selected on cost grounds by the evaluations below. The LangChain agent runs `gpt-5.6-luna` (`backend/langchain_deep_agent/config.py`), since its spend is capped separately at the provider account rather than by a token quota, and the evaluations were run against Foundry-hosted deployments only. The ingestion pipeline uses a third model, `gpt-5.2`, for the vision pass that describes charts and figures.

## Retrieval (RAG)

### Corpus

- Foundry IQ's free-tier index caps at **50 MB**, which is the binding constraint on the whole corpus, not disk and not tokens.
- Trimmed down to **two companies, Amazon and Meta**: 10-K for 2023, 2024 and 2025, plus the Q1 2026 10-Q. Eight filings, ~11 MB of source PDF.
- Two companies in the same sector was a deliberate choice over more companies shallower, because it keeps cross-company comparison questions in scope, which is what the analysis-quality evaluation set leans on.
- **The same corpus feeds both pipelines.** Identical PDFs in, so any difference in answer quality is the pipeline's, not the data's.
- Live and most-recent data is deliberately *not* in the corpus. That is the MCP server's job. The filings are historical by definition, and the tool descriptions say so explicitly to stop the agent searching the index for today's stock price.

### Side by side

| | LangChain (hand-rolled) | Foundry (managed) |
|---|---|---|
| Source of truth | `ingestion/rag-data/pdfs/`, tracked in git | Azure Blob Storage container |
| Pipeline | 3 explicit stages I wrote and run (`extract` → `describe` → `ingest`) | Knowledge Source ingests and indexes automatically |
| PDF parsing | `docling`, converted in 10-page chunks to bound memory | Content extraction mode (multimodal), configured on the source |
| Tables | Extracted to their own chunks with 2 lines of surrounding context | Preserved by the extraction mode |
| Charts / images | Vision model writes a description per page image; the description is what gets embedded | Image verbalisation, done by the service |
| Chunking | Page-level for text, one chunk per table, one per image description | Service-managed |
| Store | Qdrant Cloud, named dense + sparse vectors | Foundry IQ index |
| Retrieval | Hybrid dense + BM25, optional metadata filter, `k` clamped to 8 | Set by reasoning level: agentic at medium, direct lookup at minimal |
| Metadata / filtering | Parsed from filename, keyword payload indexes, model-supplied filters | Handled by the service |
| Re-ingestion | Idempotent on `(file_hash, page)`; drop new PDFs in and re-run | Drop new blobs in the container; the source re-indexes |
| Control | Total: every knob is a constant I own | Coarse: extraction mode, retrieval model, reasoning level |
| Effort | Days, and three failure modes to debug | Hours, mostly clicking |

### Foundry: managed ingestion

- **Knowledge Source** points at an **Azure Blob Storage** container holding the eight PDFs. Uploading a blob is the entire "ingestion" step. No pipeline of my own runs.
- **Content extraction mode** is the setting that matters most. Plain text extraction flattens a 10-K into prose and loses the financial statements entirely; the multimodal mode is what preserves **table structure**, which is where nearly every number worth retrieving lives.
- **Image verbalisation** handles the charts and figures, with the service captioning them into text at index time.
- Strategy is deliberately **mono-modal**: everything, including tables and charts, becomes text before it is indexed. One modality means one retrieval path and no fusion to tune. This is the same strategy the LangChain pipeline arrives at by hand, which makes the two genuinely comparable.
- **Knowledge Base** wraps the knowledge source and is what gets attached to the agent. It carries its own **retrieval model** and **retrieval reasoning level**, currently `gpt-5.4-nano` at minimal, reduced from medium.
- At medium and above, retrieval is **agentic** rather than a single similarity lookup: the retrieval model decomposes the question and issues its own queries against the index. That is where the quality comes from, and also where the cost goes.
- Known rough edge: medium reasoning routinely returns **40+ documents**, which floods the agent's input context. Lowering the reasoning level is the obvious lever.
- **Update: reasoning level dropped from medium to minimal.** Agentic retrieval was drawing significant fees, and the planning step is itself a source of token consumption on top of the documents it returns. At minimal the knowledge base no longer runs an internal agent to plan and generate queries; the knowledge sources are queried directly. This should cut search costs by removing that second consumer of tokens entirely. What it does to retrieval quality is not yet measured, and the evaluations below were all run at medium, so they describe the previous behaviour rather than the current one.

### LangChain: hand-rolled pipeline

Three idempotent stages (`ingestion/`), each safe to re-run. Only new material is processed.

**1. Extract (`docling`).** One PDF in, three artifact types out:

- `markdown/`: full text with page-break markers driving page numbering
- `tables/`: one file per table, with the preceding 2 lines as context so a bare grid of numbers still has a heading attached
- `images/`: page renders, but only for pages containing a figure larger than 250 px

Large 10-Ks are converted **10 pages at a time**. Whole-document conversion OOMs (`std::bad_alloc`); docling keeps absolute page numbers across chunks so the numbering survives the split.

**2. Describe (vision model).** Every extracted page image gets a text description written by `gpt-5.2`, prompted specifically to pull metrics, data points and trends out of charts rather than describe them visually. **The description is what gets embedded, not the image.** This is the mono-modal decision, made in code.

**3. Ingest (Qdrant).** The three artifact types become one collection:

- Chunking: **page-level** for text, one chunk per table file, one per image description. Chosen over a fixed token window because a filing's natural unit *is* the page, and it keeps a table intact rather than splitting it mid-row.
- Every chunk carries `company_name`, `doc_type`, `fiscal_quarter`, `fiscal_year`, `content_type`, `file_hash`, `source_file` and `page`, all parsed from the filename convention `<company> <doc_type> [<quarter>] <year>`.
- **Hybrid**: `text-embedding-3-small` (1536-dim, cosine) as `dense-vector` alongside **BM25** as `sparse-vector`. Dense alone is weak on exactly what this corpus is made of (ticker symbols, line-item names, literal figures), and sparse alone misses paraphrase.
- Keyword payload indexes on the five filterable fields; without them Qdrant 400s any filtered search.
- Idempotency key is `(file_hash, page)`, so a re-run embeds only what is new and a rate limit mid-ingest is resumable.

### Retrieval at query time

Implemented in `backend/langchain_deep_agent/rag.py`.

- `get_corpus_manifest` is called **first**: it scrolls the collection once and reports exactly which companies, doc types, years and quarters exist. It exists to stop the agent filtering on values that aren't there, and to let it say "not in the corpus" instead of searching for something that was never ingested.
- `hybrid_search` then runs dense + sparse with an optional metadata filter the model supplies. The prompt tells it to filter as narrowly as it is confident and **no narrower**, because over-filtering silently zeroes out valid results.
- `k` is **clamped to 8 in code**, not just asked for in the prompt: one call asking for hundreds of chunks is the cheapest way to run up a bill.
- Per-chunk text is truncated to 4,000 chars, and any tool result to 10,000. Every tool result stays in the sub-agent's context for the rest of its loop, so an oversized one is paid for repeatedly.
- **No reranker.** Hybrid retrieval plus a tight `k` plus agentic re-querying by the sub-agent covers the same ground. A cross-encoder pass is the obvious next step, and is noted here as future work rather than a gap.

## Model Evaluations

### Methodology

- Foundry Evaluations is used to analyse several agents with access to the **same knowledge base and same system prompt, but a different LLM model** each.
- Models selected were **GPT-5.6-Terra, GPT-5.6-Luna, GPT-5.4 and GPT-5.4-Nano**, chosen for a good spread of model capability and token pricing.
- Evaluators are set up which use LLMs to evaluate and grade the agent's response against specific criteria such as groundedness, relevance, and similarity to a ground-truth expected answer.
- Split into two evaluation datasets: one looking specifically at **retrieval** capability, meaning finding relevant information in the document corpus, and one looking at how comprehensive a **financial analysis** the agent can produce.
- The knowledge base used `gpt-5.4-nano` as its retrieval model at **medium** retrieval reasoning level for every run below. Medium routinely returned upwards of 40 documents, enough to flood input context, which is what later prompted the drop to minimal described above. The scores here therefore reflect the previous retrieval configuration. Further testing is required to see overall impact of minimal reasoning on retrieval quality and analysis quality.

### Retrieval Quality

**Evaluators:** Relevance, Groundedness, Similarity.

**Dataset format:** `query`, `ground_truth`. The ground truth is used by the Similarity evaluator to compare the agent response against the expected answer and grade how close it got.

The set tests things such as the ability to retrieve figures and data out of tables and charts:

<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
  <img src="https://res.cloudinary.com/duevte0ku/image/upload/w_1000,q_auto,f_auto/v1786004140/retrieval-test-table_xsuuts.png" alt="Retrieval test - figure inside a filing table" class="rounded-lg border border-gray-700 w-full h-auto" />
  <img src="https://res.cloudinary.com/duevte0ku/image/upload/w_1000,q_auto,f_auto/v1786004140/retrieval-test-chart_sw36ci.png" alt="Retrieval test - data point inside a filing chart" class="rounded-lg border border-gray-700 w-full h-auto" />
</div>

Ten queries in total, with the [full dataset on GitHub](https://github.com/lbirchenough/agent-chat-rag-mcp/blob/main/backend/foundry/evaluations/retrieval-quality.jsonl). A representative few:

- *"What was Amazon's AWS revenue in 2023"* → `$90,757 million`
- *"how much cash did meta have end of q1 2026"* → `$23,426 million`
- *"what was meta's net carrying amount of acquired technology year ending december 31, 2022"* → `$363 million`
- *"what was metas revenue from advertising in asia-pacific in september 2023"* → `$6.829 billion of advertising revenue`

Queries are written informally, typos and missing apostrophes included, since that is how the thing actually gets used.

![Retrieval quality evaluation runs](https://res.cloudinary.com/duevte0ku/image/upload/v1786004140/retrieval-quality-eval-runs_enjygu.png)

The original run had reasonable results for all models, however **GPT-5.4-Nano and GPT-5.6-Luna both had similarity issues on two occasions**. Further investigation revealed that in those instances they retrieved the correct figure from an *older* SEC filing, and so the answer given did not align to the ground truth, which was taken from the most recent document in the corpus containing that figure.

A re-run of the evaluation was done with an adjusted agent system prompt instructing it to **prefer newer sources** when the same information is found in multiple documents. On the re-run, GPT-5.4-Nano showed more concerning errors. In one instance it read the wrong figure out of a table, producing an incorrect result.

### Analysis Quality

**Evaluators:** Relevance, Groundedness, Fluency, Coherence, Tool Selection, Response Completeness.

**Dataset format:** `query`, `required_elements`. Required elements is used by the Response Completeness evaluator as a rubric for what a comprehensive response to that particular query should contain.

Five queries, each paired with its rubric. The [full dataset is on GitHub](https://github.com/lbirchenough/agent-chat-rag-mcp/blob/main/backend/foundry/evaluations/analysis-quality-eval.jsonl).

![Analysis quality evaluation runs](https://res.cloudinary.com/duevte0ku/image/upload/v1786004140/analysis-quality-eval-runs_s1vcyt.png)

Fairly strong scoring across the board, with the only major flag being **GPT-5.4-Nano failing on Response Completeness**, where it did not produce a response covering enough of the required elements and failed to meet the pass threshold.

### Conclusion

- Looking at the evaluation scores overall, they align with a rough estimation of model quality, with GPT-5.4-Nano producing more errors and lacking the depth of analysis the other models are capable of.
- With the basic evaluations performed it could be concluded that for a real-world production system used in a commercial application, **GPT-5.4-Nano would not be sufficient**.
- Picking between the remaining models becomes a little harder, and further evaluations could be done to isolate a true winner. If quality and accuracy are paramount, the only model that scored 100% was **GPT-5.6-Terra**, but that is also the most expensive. If cost is also a factor, **GPT-5.6-Luna** might be more suitable given it is cheaper and still scored highly. GPT-5.4 actually has a similar cost to Terra, so it makes more sense to go with the newer model.
- For this showcase project, **cost is more concerning to me than overall response quality**, and so I have selected **GPT-5.4-Nano**. Not only is it by far the cheapest in terms of token cost, it also used fewer tokens than the other models.
- GPT-5.4-Nano used **112,093 total tokens across the 5 analysis-quality queries**, at an approximate **95% input to 5% output** token ratio. This is useful for determining a rough spending cap for the project, covered in Cost Mitigations below.

## Security

![Inbound request security layers](https://res.cloudinary.com/duevte0ku/image/upload/v1786027253/security1inbound_mfidoo.png)

Four layers, each doing one job, none of them relied on alone.

### 1. Edge: Cloudflare Pages

- **Turnstile** on the two `POST` turn endpoints. Its job is *not* the model bill, since the global rate limit already caps that. Its job is **who spends the allowance**. The cap is deliberately global, so a script posting six times a minute costs nothing extra and locks every real visitor out indefinitely. Turnstile makes the cheap half of that attack expensive.
- Verification happens **at the edge**, in the Pages Function, and **fails closed**. If `siteverify` is unreachable the turn is refused.

### 2. The front door: proxy shared secret

- The Pages Function adds `X-Proxy-Secret`; `backend/app/proxy_auth.py` 403s anything without it
- Container Apps **always** keeps its own `<app>.<region>.azurecontainerapps.io` hostname alongside any custom domain, serving the same routes. Left open, every protection at Cloudflare's edge is one guessed URL away from being bypassed.
- Only the four real routes are forwarded; anything else 404s at the edge rather than being tunnelled.

### 3. Session integrity

- A **signed session cookie** carries both runtimes' conversation ids. The browser sends only messages. It cannot name, guess or read the key its history is stored under, so there is no id-substitution path to another user's transcript.
- One hour of inactivity, `HttpOnly`, and `Secure` turned on automatically when `PROXY_SHARED_SECRET` is set, which is also what tells the backend it is deployed.

### 4. Identity and secrets

- Azure is **keyless**. `DefaultAzureCredential` uses `az login` locally and managed identity when deployed, so no Azure API key exists to leak.
- The MCP server sits behind an Azure Functions host key.
- Cloudflare secrets are **encrypted secrets**, not plain variables, because plain ones are readable in the dashboard and in build logs.
- Rotation for the proxy secret is two places, and there is no third copy.

## Cost Mitigations

The core concern: **not exposing a chat model to the open internet without an effective spending cap.** Prompt-level pleading is not a cap; every layer below is enforced somewhere the model and the caller can't reach.

### Layer 1: Request rate (application)

- One **global** limit on how often a turn may be started: `6/minute`, across every caller (`backend/app/throttle.py`).
- Global rather than per-caller on purpose. `sid` lives in a cookie, so dropping the cookie mints a fresh allowance, which is worthless against anyone who doesn't want to be limited. IP is only trustworthy behind the proxy and buys *fairness*, not a bound on spend. **What needs bounding is the bill, and the bill doesn't care who ran it up.**
- The trade is accepted explicitly: one abuser exhausts everyone's allowance. For a demo, a stranger running up a model bill is the real risk; a stranger griefing the demo is not.
- Always enabled, unlike the proxy gate, because *a spend cap that switches itself off is not a spend cap*.
- It caps concurrency by implication too: six starts a minute against a 180s ceiling means at most ~18 turns can ever overlap, which is why there's no separate semaphore.
- **Caveat:** storage is per-process, so the container app must stay pinned to a single replica (`minReplicas: 1, maxReplicas: 1`) or the limit is multiplied by the replica count.

### Layer 2: Cost per turn (agent config)

- Recursion limit, max output tokens, wall-clock timeout, retrieval `k` ceiling and truncation caps. The same constants that do containment work also bound the token spend of a single turn.
- `MAX_TOOL_RESULT_CHARS` is specifically a cost control: every tool result stays in the sub-agent's context for the rest of its loop, so one oversized MCP payload (an entire earnings press release, in one case) is paid for on every subsequent step.

### Layer 3: Provider spend cap (LangChain side)

- The model provider's own API gives a hard cap: **$10 total on the OpenAI account, requiring manual top-up.** Simple, absolute, and outside the application entirely.

### Layer 4: Foundry quotas

- Foundry has **deployment-level quotas**, a TPM limit set per deployed model. Useful, but a rate limit is not a spend limit.
- As far as I'm aware **Foundry has no spending-cap setting at all**. Getting a real one required building it:
  1. Stand up an **AI Gateway** (Azure API Management) in Foundry and apply a **token quota** policy to the model.
  2. Route the model through the APIM gateway, which requires setting up **BYOM (bring-your-own-model)** entries that an agent can then be deployed against.
  3. Point the agent at the gateway-fronted model rather than the raw deployment.
- **This did not work first time.** A provisioning bug meant APIM was created without the required policies attached, and the calls went through ungoverned. It took a fair amount of troubleshooting to identify and get working. The failure mode is quiet, because everything *works*, it just isn't being counted.
- Verified end-to-end with `backend/foundry/test-apim.py`, hitting the gateway URL directly with the APIM subscription key.

### Layer 5: Turning a token quota into a dollar cap

The AI Gateway's **token quota over a time window** is the closest thing to a max-spend-per-period control Foundry offers. It counts tokens, though, and the budget is in dollars, so the two have to be reconciled. The target is a hard ceiling of **$10 per month**.

**Pricing.** GPT-5.4-Nano Global bills at **$0.20 per 1M input tokens** and **$1.25 per 1M output tokens**

**Ratio.** The evaluations measured GPT-5.4-Nano at roughly **95% input to 5% output**. Working off a 90/10 split to add a safety margin for more expensive output tokens, the blended rate is $0.305 per 1M tokens

**Monthly ceiling.** $10 divided by $0.305 per 1M gives 32,786,885 tokens per month, approx **1 Million/Day** Token Quota

Assumption of worse case no cache cost saving as most of input tokens for a query are coming from RAG retrieval documents which would differ each query.

## Links

- [Live App](https://agent.lbirchen.com/)
- [GitHub](https://github.com/lbirchenough/agent-chat-rag-mcp)
