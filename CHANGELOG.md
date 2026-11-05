# Changelog

## [0.5.0](https://github.com/chen-yu-cy/SinoFlow/compare/v0.4.0...v0.5.0) (2026-11-05)


### Features

* **health:** elevate /api/health with responsive dashboard, service latency & commit link ([9b1c40f](https://github.com/chen-yu-cy/SinoFlow/commit/9b1c40fe0ee3a953550c8ac8a91c94d843544896))
* **infra:** integrate wireguard vpn service with dynamic public host detection ([#12](https://github.com/chen-yu-cy/SinoFlow/issues/12)) ([3693f76](https://github.com/chen-yu-cy/SinoFlow/commit/3693f76b9e101163e651b929a80bd8f4ac6a4d56))
* **monitoring:** add container health status wall and uptime panels to grafana hardware dashboard ([#15](https://github.com/chen-yu-cy/SinoFlow/issues/15)) ([63b23d9](https://github.com/chen-yu-cy/SinoFlow/commit/63b23d942389d29054b9c10053429c0851f0bd70))
* **monitoring:** add end-to-end L7 application health probe and fix container state aggregation ([#18](https://github.com/chen-yu-cy/SinoFlow/issues/18)) ([7518af7](https://github.com/chen-yu-cy/SinoFlow/commit/7518af7bbbdd6676a96c80fca35cab0d5ffe8a48))
* **monitoring:** integrate cadvisor, prometheus hardware metrics, and coredns internal domain ([#14](https://github.com/chen-yu-cy/SinoFlow/issues/14)) ([4730b24](https://github.com/chen-yu-cy/SinoFlow/commit/4730b24e95224ffc6d3bf2f3bbc91dfffebc2ba9))
* **ui:** client UI/UX polish across home, course detail, learning center and auth modal ([#20](https://github.com/chen-yu-cy/SinoFlow/issues/20)) ([19f48a9](https://github.com/chen-yu-cy/SinoFlow/commit/19f48a9799f854050745cf1f4ae0bbcfbd5979d4))
* **video:** add client-side playback telemetry beacon and unify CDN traffic metrics ([#19](https://github.com/chen-yu-cy/SinoFlow/issues/19)) ([494aecb](https://github.com/chen-yu-cy/SinoFlow/commit/494aecb65f9a67bd5bf73c11ad96001b615bdb25))


### Bug Fixes

* **infra:** use pgsty/silo and amazon/aws-cli for reliable public s3 images ([7b18306](https://github.com/chen-yu-cy/SinoFlow/commit/7b183067ef2e0191122f6afd33b42378d434ee7b))
* **monitoring:** wrap traffic metrics in sum aggregation and add vector(0) fallback for empty video logs ([#16](https://github.com/chen-yu-cy/SinoFlow/issues/16)) ([a0198de](https://github.com/chen-yu-cy/SinoFlow/commit/a0198de67f0cf7e599b1e51aaeb2f233912cd988))
* **telemetry:** extract route constants to lib module to satisfy Next.js route typecheck ([39b1ad3](https://github.com/chen-yu-cy/SinoFlow/commit/39b1ad37224c2abd83320542a20c87afc70265b1))
* **theme:** polish dark mode colors in admin layout and clean up grafana kiosk mode ([#17](https://github.com/chen-yu-cy/SinoFlow/issues/17)) ([dd9524f](https://github.com/chen-yu-cy/SinoFlow/commit/dd9524f2ca62d674b9059a521f7310e1ad9896fb))


### Performance Improvements

* **health:** replace hard reload with visibility-aware silent polling & sanitize error telemetry ([b75738d](https://github.com/chen-yu-cy/SinoFlow/commit/b75738dfd7fcfe859f73c47b054620c82002325f))

## [0.4.0](https://github.com/chen-yu-cy/SinoFlow/compare/v0.3.0...v0.4.0) (2026-11-05)


### Features

* **admin:** display video url with copy, preview and manual edit in course form ([e6cdba7](https://github.com/chen-yu-cy/SinoFlow/commit/e6cdba760c109d9d1cb2b4e5631699b53bbfa3c6))
* **infra:** add loki s3 log archive, danmaku collision avoidance, and admin notes moderation ([#9](https://github.com/chen-yu-cy/SinoFlow/issues/9)) ([ae9e92f](https://github.com/chen-yu-cy/SinoFlow/commit/ae9e92f9d1a3833997ba655e6b25eed01d037eaa))
* **perf:** Redis 缓存加速与分布式滑动窗口 API 限流系统 ([#10](https://github.com/chen-yu-cy/SinoFlow/issues/10)) ([85177c7](https://github.com/chen-yu-cy/SinoFlow/commit/85177c722ad78d8b7777daad4b53893d7db151d8))
* **storage:** enforce file format whitelist and size limits with client-server dual validation ([44249a0](https://github.com/chen-yu-cy/SinoFlow/commit/44249a0e630ed2c62b2ffce3d39ff4e77d4da936))
* **storage:** implement S3-compatible MinIO presigned direct upload ([fefbc58](https://github.com/chen-yu-cy/SinoFlow/commit/fefbc588b5c12fed3d022566496e52956ac4390e))
* **storage:** implement S3-compatible MinIO presigned direct upload with client-side canvas thumbnail extraction ([72ce038](https://github.com/chen-yu-cy/SinoFlow/commit/72ce038339c74c891a6642f00cc021c064de28a8))


### Bug Fixes

* **deploy:** set DOCKER_API_VERSION=1.44 for watchtower compatibility with modern docker engine ([f641494](https://github.com/chen-yu-cy/SinoFlow/commit/f641494eddadb4baacac147ca00b0ce13567718c))


### Performance Improvements

* **all:** add database indexes, caddy compression, and redis course list caching ([#11](https://github.com/chen-yu-cy/SinoFlow/issues/11)) ([0680b14](https://github.com/chen-yu-cy/SinoFlow/commit/0680b1414758cad0b35cf7b302e7800378465c6d))

## [0.3.0](https://github.com/chen-yu-cy/SinoFlow/compare/v0.2.0...v0.3.0) (2026-11-04)


### Features

* **caddy:** enable HTTPS for grafana via subdomain and update admin iframe resolver ([88b86ee](https://github.com/chen-yu-cy/SinoFlow/commit/88b86eed4ad394a7b94ca53d2a456673e99bb4b6))
* **caddy:** enable HTTPS for grafana via subdomain and update admin iframe resolver ([072a89b](https://github.com/chen-yu-cy/SinoFlow/commit/072a89b1527b93aa87d1ec3d764db0622a1aff69))
* **monitoring:** add caddy access logging, automated grafana traffic dashboard, and admin monitoring view ([89a755f](https://github.com/chen-yu-cy/SinoFlow/commit/89a755f020415d9ecaab1f65f723fa98204ffccc))
* **monitoring:** add caddy access logging, automated grafana traffic dashboard, and admin monitoring view ([ff1c7da](https://github.com/chen-yu-cy/SinoFlow/commit/ff1c7dadddbba01ff3b133ca15a2259d667d2288))

## [0.2.0](https://github.com/chen-yu-cy/SinoFlow/compare/v0.1.0...v0.2.0) (2026-11-04)


### Features

* add admin order history page and fix link hover event runtime error ([0f66d4f](https://github.com/chen-yu-cy/SinoFlow/commit/0f66d4f4e6ec40fa63040a85a21a5b974fbe8cbb))
* add confirmation to individual lesson removal in course form ([3b6264e](https://github.com/chen-yu-cy/SinoFlow/commit/3b6264e90d6e76f4306303a09deceab2e7a37553))
* add dynamic route handler for uploads with Range and cache support ([b32a028](https://github.com/chen-yu-cy/SinoFlow/commit/b32a028a02b738b01a43e1173f2a002a91c2db4e))
* add full Spanish (es) localization support for all page keys and language switcher ([13d369a](https://github.com/chen-yu-cy/SinoFlow/commit/13d369a308e77f88cf414ec3ee2461b30b779149))
* add hls.js for cross-browser HLS video support ([09627df](https://github.com/chen-yu-cy/SinoFlow/commit/09627dfc4559143c02dda75204c32c16737586b0))
* add isFeatured column to Course model, implement homepage fallback selection algorithm, and add admin star toggler ([fb50abd](https://github.com/chen-yu-cy/SinoFlow/commit/fb50abd884c6cb9aeb6992bf50beeae2156e8001))
* complete UI/UX enhancements and verify git hooks ([c092a71](https://github.com/chen-yu-cy/SinoFlow/commit/c092a71e023d3132c968359720f1ec966d0e28da))
* **config:** centralize all preset credentials into .env and optimize Docker build ([4026466](https://github.com/chen-yu-cy/SinoFlow/commit/40264663e2afe65eae5f702213c1a88db8030228))
* course unlock navigation, video notes/danmaku, mobile responsive, dark mode and automated release ([a32186b](https://github.com/chen-yu-cy/SinoFlow/commit/a32186bfd6ce0a2beb1e0a5f810eb45aad7b7379))
* **course:** fix unlock button scroll navigation and add timeline note markers and danmaku overlay ([6023406](https://github.com/chen-yu-cy/SinoFlow/commit/60234065420870fd7caa90b4514cbd3288849cab))
* default i18n fallback to English (en) while preserving Chinese (zh) for test env assertions ([183bbed](https://github.com/chen-yu-cy/SinoFlow/commit/183bbede48cb50c5fa2932dc5617cf568c42ba45))
* **deploy:** add automated deploy.sh script and idempotent database seeding ([d767627](https://github.com/chen-yu-cy/SinoFlow/commit/d767627997e817e5d4708a655eb814906f37d8fd))
* **deploy:** auto-install Docker and configure 2GB swap on fresh Linux VMs in deploy.sh ([ef03dde](https://github.com/chen-yu-cy/SinoFlow/commit/ef03dde9049bc874f8d27045ca4e3b9eb90a9923))
* **deploy:** enable one-click Docker deployment for AWS MVP ([ac38ea0](https://github.com/chen-yu-cy/SinoFlow/commit/ac38ea04a62230770ff984253f35eaed81a1426f))
* design and implement calligraphic S icon as site favicon ([7ee9657](https://github.com/chen-yu-cy/SinoFlow/commit/7ee9657fa263faee663b51408207e2728d5b9e08))
* design and implement high-security AdminConfirmModal ([716749b](https://github.com/chen-yu-cy/SinoFlow/commit/716749b60b6458650a6a6d6688bdb081f946308c))
* enable dynamic metadata display and admin quick edit on course cards ([4fdadbd](https://github.com/chen-yu-cy/SinoFlow/commit/4fdadbd8d42c1bf307c30231550fdac93724a28a))
* extend course model with level/duration and update standards ([46919b6](https://github.com/chen-yu-cy/SinoFlow/commit/46919b68650b430dba573a9fe0c3c17922a26044))
* fix server component scroll click runtime error with native anchor scroll, add interactive notes feature intro page ([e273826](https://github.com/chen-yu-cy/SinoFlow/commit/e27382609a504ec0dff48e59113ca2016d95c743))
* grant administrators direct access to all course videos ([24624f1](https://github.com/chen-yu-cy/SinoFlow/commit/24624f1443419121707046d09ca3280f03e4341e))
* implement 'My Courses' page and navigation link ([08082bd](https://github.com/chen-yu-cy/SinoFlow/commit/08082bdd2ff9cd9536e1404f8ce90a642b8ebf2c))
* implement admin dashboard, course creation persistence and update GEMINI.md standards ([4438f6c](https://github.com/chen-yu-cy/SinoFlow/commit/4438f6cba6a690389ae429a18809aa1e33559edf))
* implement automated API documentation with Swagger (OpenAPI) ([2ed356a](https://github.com/chen-yu-cy/SinoFlow/commit/2ed356a257053a5495b62defa04aa493d78b861e))
* implement automated video thumbnail extraction and full-site rendering ([d4b4792](https://github.com/chen-yu-cy/SinoFlow/commit/d4b4792f7cf0fce5a30347a770fc1fd3a1c6eda4))
* implement automatic browser language detection using Accept-Language header in i18n helper ([99bc8fd](https://github.com/chen-yu-cy/SinoFlow/commit/99bc8fd2099936da9016e2f9d79a056ece6b965e))
* implement core UI layout, homepage and course detail page with HLS player ([c12de50](https://github.com/chen-yu-cy/SinoFlow/commit/c12de50ee8f80bac0dda9eddf661a4eb3ac58ca7))
* implement course editing and administration pages ([25e2dce](https://github.com/chen-yu-cy/SinoFlow/commit/25e2dceda27e70b8931090bce29e1e13b5b0d7ac))
* implement course list view and layout toggle functionality ([05ff89e](https://github.com/chen-yu-cy/SinoFlow/commit/05ff89e366eecf5701fb3b307f2b9ccb2d2a1519))
* implement course progress tracking and visualization ([00215b4](https://github.com/chen-yu-cy/SinoFlow/commit/00215b486fb626321746c325a250a019932eecd0))
* implement credentials authentication with Auth.js and bcrypt ([432f213](https://github.com/chen-yu-cy/SinoFlow/commit/432f213cc1edd17c873482ed2323049f945c1211))
* implement curriculum resource materials management in course creation and update forms ([3637f5a](https://github.com/chen-yu-cy/SinoFlow/commit/3637f5afe37ce0f38aa795dbc78cd19d07a351d8))
* implement custom HTML5 video player with speed, seek controls, and glassmorphism bar ([89faa3b](https://github.com/chen-yu-cy/SinoFlow/commit/89faa3b8bfed8da6ca0c6aa0da4e5851385b3456))
* implement downloadable companion resources with secure access control ([ba3c012](https://github.com/chen-yu-cy/SinoFlow/commit/ba3c0126952e4fa777b45c7a95b142e0492bdfa9))
* implement intelligent autoplay for seamless lesson transitions ([d715ad9](https://github.com/chen-yu-cy/SinoFlow/commit/d715ad9140516e6c2d6fcc05702dbe162cbb430c))
* implement interactive user navigation dropdown with admin entry ([75079ee](https://github.com/chen-yu-cy/SinoFlow/commit/75079ee72e9b60422d750ed03aa5356ff599d4a6))
* implement order creation and payment simulation API ([ca841c3](https://github.com/chen-yu-cy/SinoFlow/commit/ca841c39086d42a69cd3be5c537e0b7a1019fc0a))
* implement per-lesson preview functionality and interactive content switcher ([2c52667](https://github.com/chen-yu-cy/SinoFlow/commit/2c526676d9e39e08ee0f9fcbfbef8e07620c8f3c))
* implement server-side search and difficulty filtering for course directory ([4db038b](https://github.com/chen-yu-cy/SinoFlow/commit/4db038b9dec8389a65836f7c5726631a6f6b0267))
* implement Service Layer architecture for business logic separation and testability ([eaef7e5](https://github.com/chen-yu-cy/SinoFlow/commit/eaef7e5075d4a724d2c134cd97128f2d65129b05))
* implement support ticket system with tracking and admin replies ([207ef97](https://github.com/chen-yu-cy/SinoFlow/commit/207ef97958e3e15bdf698ab51feaab89edaab2db))
* implement timestamped study notes with purchasing lock restriction and visual promotion ([e018400](https://github.com/chen-yu-cy/SinoFlow/commit/e0184009b5c76369d7e16a35f007a3bc8ee35dc1))
* implement user settings page for password updates, connect layout menus, and update tests ([ba1e7e1](https://github.com/chen-yu-cy/SinoFlow/commit/ba1e7e199f5002d0c77c219df6933826970dc0c5))
* implement verifyAdminPassword and cascaded course deletion logic ([c4aa771](https://github.com/chen-yu-cy/SinoFlow/commit/c4aa7717165410c6d0fabab38eb5593421e61fe6))
* implement video access control based on purchase status ([39c85ab](https://github.com/chen-yu-cy/SinoFlow/commit/39c85ab5f2a429d23ae6dc8a343350df59d34ea4))
* implement website internationalization i18n with english and chinese support ([80f9f73](https://github.com/chen-yu-cy/SinoFlow/commit/80f9f7325f07f833a476f9c5ba33a13d44ac0c75))
* integrate Pino logger and add Loki + Promtail + Grafana services in docker-compose ([f854d5e](https://github.com/chen-yu-cy/SinoFlow/commit/f854d5e38bb78172c6032f1aaee44ecd3bc8fa50))
* modernize admin UI with interactive course form and user navigation ([f7e9a0b](https://github.com/chen-yu-cy/SinoFlow/commit/f7e9a0b331538ce77967788fa37ae25b835a524f))
* **ops:** add Caddy reverse proxy, /api/health endpoint, automated DB backup script, and image pruning ([9bbdc4b](https://github.com/chen-yu-cy/SinoFlow/commit/9bbdc4bdb139bc444cf85fd15328e08ffb7a2f9b))
* **ops:** auto-provision Grafana Loki datasource, persist grafana_data, and add Docker log rotation ([de3effc](https://github.com/chen-yu-cy/SinoFlow/commit/de3effc216a415355d1a2308816880710666fa82))
* optimize admin user management with sorting, details course modal, and impersonation exit mechanism ([b2399a7](https://github.com/chen-yu-cy/SinoFlow/commit/b2399a78c48d39e7d09dc223e3252bf65e880216))
* polish homepage title and subtitle with realistic media-oriented copy ([f159aa5](https://github.com/chen-yu-cy/SinoFlow/commit/f159aa511410f0518220f5ddf00d5af3f23ebfba))
* refactor course actions with password validation and improved alignment ([95b6c78](https://github.com/chen-yu-cy/SinoFlow/commit/95b6c789cd18aaf0a2ba209af0290bd0b59cc102))
* refactor order creation and fulfillment to OrderService ([fff21e5](https://github.com/chen-yu-cy/SinoFlow/commit/fff21e5a353b825472d1919c2daa86d8bc26a094))
* refactor payment module to use Factory/Strategy pattern with MockProvider ([bfe34aa](https://github.com/chen-yu-cy/SinoFlow/commit/bfe34aaa2b2244afa9ce5dd844baa08259365e33))
* rename homepage title to Chinese Video Learning Website ([e742fcc](https://github.com/chen-yu-cy/SinoFlow/commit/e742fcc274f5a671a08b14638ec19e0660dc7fb0))
* restrict free trial playback to 30% progress with timeline indicator and tooltip ([e8fb7be](https://github.com/chen-yu-cy/SinoFlow/commit/e8fb7bef71a905efebfecc55517cd20d78488f29))
* separate homepage from detailed all-courses list view ([8174ba4](https://github.com/chen-yu-cy/SinoFlow/commit/8174ba4aa8b30c8dfc89cc53464564be2150b20c))
* setup prisma schema, seed script and database client ([3339170](https://github.com/chen-yu-cy/SinoFlow/commit/3339170121667260c34ab95e42c7c754c0b0a5b6))
* simplify homepage titles and remove technical terms ([f72847b](https://github.com/chen-yu-cy/SinoFlow/commit/f72847b5ab786755d5f9f98a9c3e54469729aee2))
* support isFree course option with admin confirmation modal and bypass purchase checks ([b1c827d](https://github.com/chen-yu-cy/SinoFlow/commit/b1c827d37651688a13912b4dab35da804abde740))
* support multi-turn ticket comments timeline, detail popup, dashboard overview, and full i18n localization ([4f48762](https://github.com/chen-yu-cy/SinoFlow/commit/4f48762b1370c178145aa60cb8b1b363b9a3efd6))
* support video duration parsing via ffprobe and display duration in course syllabus ([4ecbac3](https://github.com/chen-yu-cy/SinoFlow/commit/4ecbac3007d405f808ff7c2d66ad83e7416c0d8d))
* **theme:** implement dark mode support, theme toggle and fix loading background tokens ([a7c8746](https://github.com/chen-yu-cy/SinoFlow/commit/a7c8746c54afeff67d0e436184248e477f6135cc))
* upgrade UI/UX with professional icons, paper texture, and brand logo ([5d0062e](https://github.com/chen-yu-cy/SinoFlow/commit/5d0062e0b18e59aa9ee3f83dc722e7ec99f0fc5d))
* use native FFmpeg for robust thumbnail extraction and add service tests ([64468d4](https://github.com/chen-yu-cy/SinoFlow/commit/64468d47e65dad4c1fdca0c2486c7e612ce6dc34))
* **version:** expose app version and git SHA in /api/health and /admin, and add GHCR Docker publish workflow ([e2a6604](https://github.com/chen-yu-cy/SinoFlow/commit/e2a660420697a4960bcc04909e57cadac33c5a02))
* wrap course thumbnail in link to support clicking into detail pages ([cc160f8](https://github.com/chen-yu-cy/SinoFlow/commit/cc160f89636e8eae48a9bb1dce7909e849c96263))


### Bug Fixes

* **docker:** copy bcryptjs into production runner stage for seed.mjs ([142d55d](https://github.com/chen-yu-cy/SinoFlow/commit/142d55d96c2d7efaa4ae729141b1302d9c77cac7))
* **docker:** ensure public directory and seed PDFs exist during CI Docker build ([e03e597](https://github.com/chen-yu-cy/SinoFlow/commit/e03e597b2d9433cef52cb69cfd3442aa8357487b))
* implement validation in CourseService and improve Action error reporting ([e535273](https://github.com/chen-yu-cy/SinoFlow/commit/e535273cae7e7aecb993bf189d27cd9caaee6914))
* install missing ajv dependency for swagger-jsdoc ([464055d](https://github.com/chen-yu-cy/SinoFlow/commit/464055dcce7cd9f815e33c08896ec20d73424eda))
* remove syntax error in src/app/page.tsx ([8174ba4](https://github.com/chen-yu-cy/SinoFlow/commit/8174ba4aa8b30c8dfc89cc53464564be2150b20c))
* resolve character encoding issue in mock payment callback ([3716a9e](https://github.com/chen-yu-cy/SinoFlow/commit/3716a9e99656bd1896174d6bc18c48d1b4a28d1e))
* resolve enum crash in course creation and add required field markers ([1133b4a](https://github.com/chen-yu-cy/SinoFlow/commit/1133b4a7caffd7db61b3a8b890e99c048d3ed8d7))
* resolve UserNav syntax error and restore full-site thumbnail data passing ([cebe2e4](https://github.com/chen-yu-cy/SinoFlow/commit/cebe2e4b79d99df1cc760ba724d6fc6274aa0c8f))
* show learning badge and lesson title conditionally based on access control ([4c4aad0](https://github.com/chen-yu-cy/SinoFlow/commit/4c4aad04c79622d7bc68bc8c443dd0d6a7657988))
* support native MP4 playback in VideoPlayer and update tests ([a937af7](https://github.com/chen-yu-cy/SinoFlow/commit/a937af7f05cd980db84809b4850faf1fa70ed468))
* translate purchase lock banner text and button labels dynamically ([377a1bb](https://github.com/chen-yu-cy/SinoFlow/commit/377a1bbc8740c00803191e2864f948bfee9bbc27))
