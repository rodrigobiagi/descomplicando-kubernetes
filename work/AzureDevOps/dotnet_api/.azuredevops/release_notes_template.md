# 🚀 Release v{{buildDetails.buildNumber}}

## 🧰 [{{buildDetails.buildNumber}}]({{get '_links.web.href' buildDetails}})

Started By: {{buildDetails.requestedFor.displayName}}  
Start Time: {{date buildDetails.startTime 'llll'}}  
Build Duration: {{date (subtract (date buildDetails.finishTime 'x') (date buildDetails.startTime 'x')) 'mm:ss'}}  

## Associated Pull Requests ({{pullRequests.length}})

{{#forEach pullRequests}}

* Pull Request [#{{this.pullRequestId}} {{this.title}}]({{replace (replace this.url "_apis/git/repositories" "_git") "pullRequests" "pullRequest"}})
{{/forEach}}

## Associated Azure Board Items ({{workItems.length}})

{{#forEach this.workItems}}

* Item [#{{this.id}} {{lookup this.fields 'System.Title'}}]({{replace this.url "_apis/wit/workItems" "_workitems/edit"}})
{{/forEach}}

## Commits Associated ({{commits.length}})

{{#forEach commits}}
by <b>{{author.displayName}}</b> {{#if (gt changes.length 0)}}({{inflect changes.length "file" "files" true}} changed) {{/if}}- <i> {{replace message '#' '# '}} </i></small>  
{{/forEach}}

---
