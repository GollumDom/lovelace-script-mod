console.log('%c Custom JS :%c 0.0.1 ', 'background: #222; color: #bada55', 'background: #bada55; color: #222');


export function findConfig(node) {
	if (node.config) return node.config;
	if (node._config) return node._config;
	if (node.host) return findConfig(node.host);
	if (node.parentElement) return findConfig(node.parentElement);
	if (node.parentNode) return findConfig(node.parentNode);
	return null;
}

function injectInElement(cardName) {
	customElements.whenDefined(cardName).then(() => {
		const HaCard = customElements.get(cardName);
		if (HaCard.prototype.customScript_patched) return;
		HaCard.prototype.customScript_patched = true;
		
		const _firstUpdated = HaCard.prototype.firstUpdated;
		HaCard.prototype.firstUpdated = function (changedProperties) {
			
			const config = findConfig(this);
			if (config && config.custom_script && config.custom_script.before) {
				const fc = Function(`const fc = ${config.custom_script.before}; fc.apply(this, arguments);`)
				fc(this, changedProperties);
			}
			_firstUpdated?.bind(this)(changedProperties);
			if (config && config.custom_script && config.custom_script.after) {		
				const fc = Function(`const fc = ${config.custom_script.after}; fc.apply(this, arguments);`)
				fc(this, changedProperties);
			}
			
			
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