# AutoShop legacy symbol format helper

This helper is launched by AutoShopTextBridge using the existing bundled `resources/engine/python/python.exe`. Users do not install Python. It accepts bounded UTF-8 JSON bytes through stdin and returns a single JSON receipt. It does not operate an IDE or accept user file paths.

`vendor/` contains separate, readable, unmodified xlrd 2.0.2 and xlwt 1.3.0 library sources. They must remain separate from obfuscated adapter code. Complete license notices and the original corresponding xlwt source archive accompany them. Consult THIRD-PARTY-NOTICES.txt and licenses/ for all terms, including LGPL-derived portions and advertising acknowledgement; this file makes no legal assurance.

The symbol tool imports a complete nonempty replacement table, not appended rows. The C# adapter retains the complete original native XLS export under its recovery root before import, checks a fresh semantic hash, and verifies native export plus view reopening afterward. Empty replacement remains unverified and rejected. Read preserves native address strings; write currently permits only verified M/D 0..9999 addresses. Full project save/restart verification is a separate operation.

The helper preserves requested symbol values, not arbitrary XLS formatting or hidden workbook objects. It rejects formulas, unknown workbook structures and oversized input. The caller applies an external deadline and terminates only its owned helper on timeout; this is not a general-purpose security sandbox.

The owned Python process is assigned to a dedicated Windows Job before receiving its request. KILL_ON_JOB_CLOSE terminates it if the parent worker is externally cancelled; assignment failure refuses parsing. IDE processes are never assigned. No parser memory sandbox is claimed. symbol.read also saves complete UTF-8 JSON beside the native XLS export; the dispatcher can decline model grants for oversized results without losing the exported data.

At asset collection, only our symbol_worker.py is compiled with the packaged CPython 3.12 into same-directory symbol_worker.pyc and removed from the package. Native execution requires this .pyc; source fallback exists only in a build explicitly compiled with SYMBOL_SOURCE_DEVELOPMENT. Third-party vendor sources and complete notices remain unchanged readable files. This is bytecode protection, not irreversible encryption.
