# lovelace-script-mod
Add custom script in lovelace card

## Usage
 
Add script in your configuration / Lovelace / resources:

```
https://unpkg.com/@gollum-dom/lovelace-script-mod
```

And in your card configuration:

```yaml
type: 'TYPE'
[...]
custom_script:
  before: |
    ({ main, hass, config, html }) => {
        console.log(main, hass, config, html)
    }
  after: >
    ({ main, hass, config, html }) => {
        console.log(main, hass, config, html)
    }
  style:
    hui-horizontal-stack-card:
      $: |
        ha-card {
          border: 1px red solid;
       }
    hui-horizontal-stack-card$ ha-card:
      $: |
        div {
          backgdound: green;
        }
 
          
```

