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
  before: >
    (element, changedProperties) => { console.log('before_script', element,
    changedProperties) }
  after: >
    (element, changedProperties) => { console.log('after_script', element,
    changedProperties) }
```

