console.info(
	'\n %c Lovelace Script Mod %c v0.0.1 %c \n',
	'background-color: #555;color: #fff;padding: 3px 2px 3px 3px;border-radius: 3px 0 0 3px;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)',
	'background-color: #bc81e0;background-image: linear-gradient(90deg, #b65cff, #11cbfa);color: #fff;padding: 3px 3px 3px 2px;border-radius: 0 3px 3px 0;font-family: DejaVu Sans,Verdana,Geneva,sans-serif;text-shadow: 0 1px 0 rgba(1, 1, 1, 0.3)',
	'background-color: transparent'
);

function find(node, name) {
	if (!node) return null;
	if (node[name]) return node[name];
	if (node['_' + name]) return node._config;
	if (node.host) return find(node.host, name);
	if (node.parentElement) return find(node.parentElement, name);
	if (node.parentNode) return find(node.parentNode, name);
	return null;
}

function findMainNode(node) {
	if (node.config) return node;
	if (node._config) return node;
	if (node.host) return findMainNode(node.host);
	if (node.parentElement) return findMainNode(node.parentElement);
	if (node.parentNode) return findMainNode(node.parentNode);
	return null;
}

function findAllInjectedCards(cardName, element) {
	let cards = [];

	// Cherche les éléments ha-card dans l'élément actuel
	cards = cards.concat(Array.from(element.querySelectorAll(cardName)));

	// Parcourt tous les éléments enfants pour trouver des shadow roots
	element.querySelectorAll('*').forEach((el) => {
		if (el.shadowRoot) {
			// Appel récursif pour les éléments trouvés dans le shadow DOM
			cards = cards.concat(findAllInjectedCards(cardName, el.shadowRoot));
		}
	});

	return cards;
}

function injectInElement(cardName) {
	customElements.whenDefined(cardName).then(() => {
		const HaCard = customElements.get(cardName);
		if (HaCard.prototype.customScript_patched) return;
		HaCard.prototype.customScript_patched = true;
		
		const beforeFirstUpdate = function() {
			const config = find(this, 'config');
			const hass = find(this, 'hass');
			const main = findMainNode(this);
			if (config?.custom_script?.before) {
				const fc = Function(`const fc = ${config.custom_script.before}; fc.apply(this, arguments);`)
				fc({
					hass,
					config,
					main,
					html: this.html,
					css: this.css,
					element: this
				});
			}
		}
		const afterFirstUpdate = function() {
			const config = find(this, 'config');
			const hass = find(this, 'hass');
			const main = findMainNode(this);
			if (config?.custom_script?.after) {		
				const fc = Function(`const fc = ${config.custom_script.after}; fc.apply(this, arguments);`)
				fc({
					hass,
					config,
					main,
					html: this.html,
					css: this.css,
					element: this
				});
			}
		}
		const flatKeys = (obj, prefix) => {
			prefix = prefix || '';
			let result = {};
			for(const [name, value] of Object.entries(obj))  {
				if (typeof value === 'string') {
					result[prefix + ' ' + name] = value
				} else {
					result = {
						...result,
						...flatKeys(value, prefix + ' ' + name),
					}
				}
			}
			return result;
		}
		
		function queryNestedSelectors(el, rule) {
			try {
				rule = rule.trim();
				if (rule === '') {
					return [el];
				}
				if (rule[0] === '$') {
					const shadow = el.shadowRoot;
					if (shadow) {
						return queryNestedSelectors(shadow, rule.slice(1));
					}
					return [];
				}
				const index = rule.indexOf('$');
				if (index !== -1) {
					const rest = rule.slice(index);
					rule = rule.slice(0, index);
					return [...el.querySelectorAll(rule)]
						.map(sub => sub ? queryNestedSelectors(sub, rest) : [])
						.flat()
					;
				}
				return el.querySelectorAll(rule);
			} catch(e) {
				console.error(e);
			}
			return [];
		}
		
		const addStyle = function() {
			const config = find(this, 'config');
			const style = config?.custom_script?.style;
			if (style) {
				const flatten = flatKeys(style);
				for (const [ rule, s ] of Object.entries(flatten)) {
					const targets = queryNestedSelectors(this, rule);
					targets.forEach(target => {
						const found = target.querySelector('style[data-injected="'+rule+'"]');
						if (!found) {
							const balise = document.createElement('style');
							balise.setAttribute('data-injected', rule);
							balise.innerHTML = s;
							target.appendChild(balise);
						}
					});
				}
			}
		};
		
		
		const allInjected = findAllInjectedCards(cardName, document);
		for (const injected of allInjected) {
			(() => {
				const _firstUpdated = allInjected.firstUpdated;
				injected.firstUpdated = function (changedProperties) {
					beforeFirstUpdate.bind(this)();
					_firstUpdated?.bind(this)(changedProperties);
					afterFirstUpdate.bind(this)();
				};
				beforeFirstUpdate.bind(injected)();
				afterFirstUpdate.bind(injected)();
				setTimeout(addStyle.bind(this), 100);
				setTimeout(addStyle.bind(this), 200);
				setTimeout(addStyle.bind(this), 300);
				setTimeout(addStyle.bind(this), 400);
				setTimeout(addStyle.bind(this), 500);
				setTimeout(addStyle.bind(this), 600);
				setTimeout(addStyle.bind(this), 700);
			})();
		}
		
		const _firstUpdated = HaCard.prototype.firstUpdated;
		HaCard.prototype.firstUpdated = function (changedProperties) {
			beforeFirstUpdate.bind(this)();
			_firstUpdated?.bind(this)(changedProperties);
			afterFirstUpdate.bind(this)();
			addStyle.bind(this)();
			setTimeout(addStyle.bind(this), 100);
			setTimeout(addStyle.bind(this), 200);
			setTimeout(addStyle.bind(this), 300);
			setTimeout(addStyle.bind(this), 400);
			setTimeout(addStyle.bind(this), 500);
			setTimeout(addStyle.bind(this), 600);
			setTimeout(addStyle.bind(this), 700);
		};
		
	});
}

injectInElement('ha-card');
injectInElement('hui-view');
injectInElement('ha-app-layout');

customElements.whenDefined("hui-card-element-editor").then(() => {
	const HuiCardElementEditor = customElements.get("hui-card-element-editor");
	if (HuiCardElementEditor.prototype.customScript_patched) return;
	HuiCardElementEditor.prototype.customScript_patched = true;

	const _getConfigElement = HuiCardElementEditor.prototype.getConfigElement;
	HuiCardElementEditor.prototype.getConfigElement = async function () {
		const retval = await _getConfigElement.bind(this)();

		// Catch and patch the configElement
		if (retval) {
			const _setConfig = retval.setConfig;
			retval.setConfig = function (config) {
				// Strip custom_script from the data that's sent to the config element
				// and put it back after the config has been checked
				const newConfig = JSON.parse(JSON.stringify(config));
				this._customScriptData = {
					card: newConfig.custom_script,
					entities: [],
				};
				if (newConfig.entities) {
					for (const [i, e] of newConfig.entities?.entries()) {
						this._customScriptData.entities[i] = e.custom_script;
						delete e.custom_script;
					}
				}
				delete newConfig.custom_script;

				_setConfig.bind(this)(newConfig);
				if (newConfig.entities) {
					for (const [i, e] of newConfig.entities?.entries()) {
						if (this._customScriptData.entities[i])
							e.custom_script = this._customScriptData.entities[i];
					}
				}
			};
		}
		return retval;
	};

	const _handleUIConfigChanged =
		HuiCardElementEditor.prototype._handleUIConfigChanged;
	HuiCardElementEditor.prototype._handleUIConfigChanged = function (ev) {
		if (this._configElement && this._configElement._customScriptData) {
			const customScript = this._configElement._customScriptData;
			if (customScript.card) ev.detail.config.custom_script = customScript.card;
		}
		_handleUIConfigChanged.bind(this)(ev);
	};
});

customElements.whenDefined("hui-dialog-edit-card").then(() => {
	const HuiDialogEditCard = customElements.get("hui-dialog-edit-card");
	if (HuiDialogEditCard.prototype.customScript_patched) return;
	HuiDialogEditCard.prototype.customScript_patched = true;

	const _updated = HuiDialogEditCard.prototype.updated;
	HuiDialogEditCard.prototype.updated = function (changedProps) {
		_updated?.bind(this)(changedProps);
		this.updateComplete.then(async () => {
			if (!this._customScriptIcon) {
				this._customScriptIcon = document.createElement("ha-icon");
				this._customScriptIcon.icon = "mdi:script-text";
			}

			const button = this.shadowRoot.querySelector(
				"mwc-button[slot=secondaryAction]"
			);
			if (!button) return;
			button.appendChild(this._customScriptIcon);
			if (
				this._cardConfig?.custom_script ||
				this._cardConfig?.entities?.some((e) => e.custom_script)
			) {
				this._customScriptIcon.style.display = "inherit";
			} else {
				this._customScriptIcon.style.display = "none";
			}
		});
	};
});
