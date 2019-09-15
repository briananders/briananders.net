module.exports = `
  {{#each items}}
    <a itemprop="url"
        target="_blank"
        href="{{url}}"
        class="item"
        title="{{name}}, {{playcount}} scrobbles">
      {{#if imageSrc}}
        <img src={{imageSrc}} alt={{name}} />
      {{/if}}
      <span class="name">
        {{name}}
      </span>
      {{#if artist}}
        <span class="name">
          {{artist.name}}
        </span>
      {{/if}}
      <span class="scrobbles">
        {{playcount}} scrobbles
      </span>
      <bar style="width: {{percent}}%;"></bar>
    </a>
  {{/each}}
`;
