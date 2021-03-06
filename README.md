## The problem

Lens.org is not truly one application, but 7+ largely independent systems:

- patents
- scholar
- classifications
- sequences
- citations
- institutions
- work area
- about
- support

There is some interlinking between these silos but they are not truly integrated - both in the front and backends.

This also means a multitude of technology. The frontend alone uses spring, freemarker, bootstrap, jquery ui, backbone, angular, react, redux, 3rd party jquery plugins, skyforms, stylus, sass, eqcss, handlebars, coffeescript, es5, es6. Data is delivered embedded in DOM, via properties attached to the window, JSONP, REST APIs, and numerous other APIs including Elastic search, scholar data store.

This issue has been documented in detail in [this frontend architecture overview document](https://s3-us-west-2.amazonaws.com/build.lens.org/lens-ui/LENSUI-DEVELOP/1352/architecture.html).

Re-writing all this legacy software would be costly, and not a productive use of time.

However, with a recent focus on providing users with a "Federated Search" experience, it has become apparent that using the existing frontend infrastructure is not feasible. Or at least it will not result in a fantastic UX.

This was showcased by the recent attempts at implementing scholarly-patent joins and improving the search bar integration. This work was far, far harder than it should have been, due to the many moving parts and poorly defined boundaries between systems.


## Goal

This project has two main goals:

#### 1. Create an ultra fast minimalist ui to provide federated search

This is NOT intended to replace any legacy systems, but to provide an overview of the data available for any given query, then to link off into our existing facilities.

Best summed up as: *advanced search editor with intelligent suggestions, real-time report generation using federated search. Each result or data point then deep links into existing content.*.

Instead of our home page showing of a static tour of our suite, it should instead immediately launch into an interactive showcase of what data we have available based on a user's query.

The focus is on a small set of functionality, but executed beautifully, applying smarts to get the user to find the right app/section of our site for them.

Note this is a purely frontend project. The backend services all exist, and this project assumes no changes to any baking services are required.

#### 2. Refactor the core UI code that should be shared across projects

Re-define all model schemas (Patent/Article/Citation/etc) in coherent TypeScript classes, providing type safety.

Refactor all data fetching services to provide consistent methods for data access, and make more interlinked data available to the UI.

Having an issue with an excess of technology, you'd think adding more diverse tech into the mix is not going to help. In a way this is true, however it is my earnest hope that this will provide a solid enough foundation for rapid development, that the scope of this application could gradually grow to replace legacy areas of the site.

For example, if this search experience turns out to be superior to our existing searches, the first to get retired/migrated would be Patent/Scholar/Citation searches. So while the short term goal is not to rewrite all existing frontend, I hope this will provide the foundation to achieve that in the future.


## Why the name?

When you think of a "lens", you think of something that helps you see clearly, like glasses or a microscope. But to view an entire landscape, you need a panorama. This project helps to provide that bigger picture overview of our data sets, and then select the appropriate lens to examine more closely.



## Prior work

This project is inspired by the following research / groundwork.

- [Federated Search Prototype Report](https://gist.github.com/simon-lang/aa529a14fcf64c8247602037fc2ce9b5)
- [Federated Search Screencast](https://slack-files.com/T0QP5SYMD-F8HBAURLZ-450feebe07)
- [Advanced Search Editor Requirements](https://docs.google.com/document/d/18TENgghdqa_IQIZlr8Ct4LDwOk1o6mx9stjrOW0dIos/edit)
- [Advanced Search Editor Screencast](https://slack-files.com/T0QP5SYMD-F8NJAC9FX-4546fc4567)
- [Report View Mockup](https://projects.invisionapp.com/d/main#/console/13082565/273619768/preview)
- [Frontend Architecture Overview](https://s3-us-west-2.amazonaws.com/build.lens.org/lens-ui/LENSUI-DEVELOP/1352/architecture.html)

## Workflow

#### 1. Intro

Lens logo, tagline and search bar animate into center viewport.  Only options are Search or Learn More.

Custor autofocus on the hugely prominent search input.


#### 2. First Interaction

As the user starts typing, instant feedback is provided:

- Field autosuggest
- Term autosuggest
- Boolean query syntax error information
- Formatted boolean query display
- Looks like: doi, pmid, patent pubkey ([parsers](https://github.com/cambialens/cujo/tree/develop/cujo-common/src/main/java/org/cambia/cujo/common/keys/parsers)), classification ([parsers](https://github.com/USPTO/PatentPublicData/blob/master/PatentDocument/src/main/java/gov/uspto/patent/model/classification/CpcClassification.java))
- Suggested form actions if multiple

Additionally, any cheap search operations could potentially be triggered eagerly, once the user stops typing for a reasonable length of time. These results could be helped to update autosuggest values or add additional prompts or context to the search.


#### 3. Submit Form

Depending on the detected query elements, we can display different results:

|**field**||**display**|
|---|---|---|
|doi| |view this article (with preview)|
|pubkey| |view this patent (with preview), and citations or sequence info|
|list of doi/pmid/pubkeys| |display patcite network graph (simplified using [this](https://emiliorizzo.github.io/vue-d3-network/)|
|classification(s)| |codes. see classification heirachy.|
|person name| |author, inventor. MAG will help.|
|company| |display logo if we have it. owner, applicant. "patent portfolio" is just single filter patent search. can autoor check against pre-canned applicant/owner logo list! easy.|
|institution| |display logo if we have it. in4m dossier preview and link. in4m summary.json|
|bio sequence| |patseq widget|
|list of mixed ids| |load mixed content. two columns: patent and article row-items. if connections, network graph|
|field of use or research discipline| |rankings|
|country name| |jurisdiction with flag and date range maybe?| |
|collection| |query term happens to match on a basic mysql title&description metadata search|
|boolean scholarly query| |Display number of hits, top 3 according to one or two different sorts (most cited by pantets / most recent / most relevant). Display big buttons "View List". "View Analysis". "View Citing Patents".|
|boolean patent query| |Display number of hits, top 3 according to one or two different sorts (most something / most recent / most relevant). Display big buttons "View List". "View Analysis". "View Citing Patents".|

Multiple of these can be added too if multiple formats detected.

Really smooth unobtrusive loading feedback and report elements animate in. Masonry? Maybe a small loading bar (5/7 promises complete) with single message that changes: ['fetching patents', 'fetching scholar facets', 'performing join on citations', etc.]. [see timer example at top here](https://bootstrap-vue.js.org/docs/components/alert) for any time-intensive areas of the report.

Where requests are light, we can pre-fetch these while the user types, but only display on submit.



## Technical goals

hot module reloading from day one

100% test coverage from day one because otherwise it'll never happen.

Localisation as first class feature

Process shift: move to GitHub issues for issue tracking, even if just internally.

COULD consider open-sourcing this. If we are happy enough with it. At least the purely frontend component.

nginx rule so I can link to lens.org/app and it uses pushState from there. no more `/lens` namespace


### css

Import all our SCSS variables etc and have the hot module reloaded css with animations and a basic theme ready before showing Kenny.

[Theming bootstrap](https://getbootstrap.com/docs/4.0/getting-started/theming/) is really powerful and easy with sass by the looks. vue-bootstrap is pretty impressive.

Copy paste the `variables.scss` only but start fresh with overwriting bootstrap as little as necessary to apply our theme.

When necessary import styles from lens but literally only one module at a time max. maybe even do component style file structure with the scss next to the js.

BEM. get a css linter and do not allow element selectors, ids, etc. class names ONLY.

Heavy use of intro animations to make it look and feel nice.

Try not to get dragged into a sidebar. We're escaping that design. This should also be mobile first, and that sidebar drops to the bottom anyway. Don't do facets or datepickers, etc. Not even Work Area integration - that's legacy (or v2 of this). The point of this is not to replace detailed search/filtering.


### js

TypeScript & Vue

Why Vue? [So many good pre-existing components](https://github.com/vuejs/awesome-vue). Plus it just looks and feels really good and instantly familiar.

Maybe VueX later. Looks better than Redux.

[Example Vue D3 Network Graph](https://emiliorizzo.github.io/vue-d3-network/)

Find a really good REST client. That and a grid view (vue-good-table?) and we've got the Work Area sorted, too.

Consistent internal API for Patent and Scholar queries are created. Spend lots of time on schema definition and smart interfaces.

Don't try to reproduce patent or scholar search. Actually, try not to delve into complicated filtering etc. Leave that to the legacy. Basic operations only. This has *opinionated* sorts, filters, limits, etc.

Use a proper router from the start OR with any luck this is a single page with nearly zero permalink state beyond the `q` query variable. maybe a subsection name.



## New middleware

### Current frontend stack

lens-ui

- Stylesheets
- Javascript
- HTML Templates
- Images, Fonts

bambi

- Search API proxying
- Work Area management
- Localisation
- Some template rendering

### Proposed frontend stack

lens-ui

- Stylesheets
- Javascript
- Universal template rendering
- Images, Fonts

panorama

- Universal template rendering
- Report caching
- Localisation

bambi

- Search API proxying
- Work Area management


### Explanation

This means bambi should no longer be concerned with how to present data but purely be concerned with collections, work area and proxying search requests.

The new project will take over all responsibility for rendering templates server side. It might make sense for it to also handle localisation.

Another possibility is "report caching" whereby the key results of a federated search is cached and the pre-rendered html template can be served to end users much quicker than rendering a new one.
