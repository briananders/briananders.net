module.exports = `
  {{#each items}}
    <a itemprop="url" target="_blank" href="{{url}}" class="item" title="{{name}}">
      <img src={{imageSrc}} alt={{name}} />
      {{#if ../description}}
        <span class="name">
          {{name}}
        </span>
      {{/if}}
    </a>
  {{/each}}
`;
