# lovelace-script-mod
Add custom script in lovelace card

## Usage
 
Add script in your configuration / Lovelace / resources:

```
https://unpkg.com/@gollum-dom/lovelace-script-mod@0.0.1/custom-js.js
```

And in your card configuration:

```yaml
type: 'TYPE'
[...]
custom_script:
  before: >
    (element, changedProperties) => { console.log('before_script', element,
    changedProperties) }
  after: >
    (element, changedProperties) => { console.log('after_script', element,
    changedProperties) }
```

