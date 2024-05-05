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
  after: |
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
### Before and After

Before executes before the firstUpdate of the web component and after will run just after. Of course, if the component already exists on the page when the script loads, both will immediately execute on it.
The variables in the parameter are the following:

 - **main**: Represents the current web component of the script.
 - **hass**: Represents the main hass variable of the lovelace components.
 - **config**: The config object of the component.
 - **el**: The HTML element where the script applies (often similar to main).

### Style:

The config style works similarly to the lovelace plugin https://github.com/thomasloven/lovelace-card-mod
It has the advantage of loading and applying even to elements already loaded in lovelace.

 - You can target each element in the current shadow DOM.
 - If you want to switch shadow DOMs, you must use a $ in the rules. Basically, given as an example, this rule will do this:
```
div $ span p $ label => main.querySelector('div').shadowRoot.querySelector('span p').shadowRoot.querySelector('label')
```

## Example usage

```
type: markdown
content: ' '
custom_script:
  after: |
    ({ main, hass, config, html }) => {

      const root = main.shadowRoot.querySelector('ha-markdown').shadowRoot;
      const div = document.createElement('div');
      let content = '<p>Hello World</p><ul>'
      
      Object.values(hass.devices).forEach(d => content += `<li>${d.name}</li>`)
      
      content += '</u>'
      div.innerHTML = content;
      root.appendChild(div);
      console.log(main);
    }
  style:
    ha-markdown $: |
      li {
         border: 1px red solid !important;
      }
```
![Example](https://raw.githubusercontent.com/GollumDom/lovelace-script-mod/master/docs/example.jpg)


