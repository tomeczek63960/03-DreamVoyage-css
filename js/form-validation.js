(function () {
    'use strict';

    let validators = {

        notBlank: function (value, option) {
            value = value.join(' ');
            value = value.trim();
            return value.length > 0 ? { valid: true } : { valid: false, message: "Podane pole nie może pozostać puste" };
        },
        regex: function (value, option) {
            value = value.join(' ');

            value = value.trim();
            let patt = option.regex;
            return patt.test(value) ? { valid: true } : { valid: false, message: 'Niepoprawna składnia' };
        },
        correctLength: function (value, option) {
            value = value.join(' ')
            value = value.trim();
            let requiredLength = option.correctLength;

            return requiredLength === value.length ? { valid: true } : { valid: false, message: `Wymagana ilość ${requiredLength} znaków` };
        },
        quantityChecked: function (valueGroupFields) {
            if (valueGroupFields.length > 4 || valueGroupFields.length < 2) {
                return { valid: false, message: 'Zaznacz miedzy 2 a 4 pola' };
            } else {
                return {
                    valid: true
                };
            };
        },
    };

    let getSelector = function (name, formName, isgroup) {
        let selector = `${formName}[${name}]`;
        if (isgroup) {
            selector = selector + '[]';
        };
        return selector;
    };
    let getFormFields = function ($form, selector) {
        let fullSelector = `[name = "${selector}"]`;
        return $form.querySelectorAll(fullSelector);
    };
    let getErrorWrapper = function (field) {
        let errorWrapper = field.parentNode;
        while (!errorWrapper.classList.contains('form-field-wrapper')) {
            errorWrapper = errorWrapper.parentNode;
        };
        return errorWrapper.querySelector('.error-wrapper');
    };

    let isRadioOrCheckbox = function (field) {
        let fieldTyppe = field.type;
        return 'radio' === fieldTyppe || 'checkbox' === fieldTyppe;
    };

    let validationFormWrapper = function ($form, formName, validationRules) {

        let addEventForFields = function () {
            for (let validationRulesName in validationRules) {
                let isgroup = validationRules[validationRulesName].group;
                let selector = getSelector(validationRulesName, formName, isgroup);
                let formFields = getFormFields($form, selector);

                for (let i = 0; i < formFields.length; i++) {
                    let radioOrCheckbox = isRadioOrCheckbox(formFields[i]);
                    if (radioOrCheckbox) {
                        formFields[i].addEventListener('click', onClick);
                    } else {
                        formFields[i].addEventListener('blur', onBlur);
                    };
                };
            };
        };

        let getValidation = function (inp) {
            for (let validationRulesName in validationRules) {
                let isgroup = validationRules[validationRulesName].group;
                let selector = getSelector(validationRulesName, formName, isgroup);
                let formFields = getFormFields($form, selector);
                let errorWrapper = getErrorWrapper(formFields[0]);
                let fieldValue = validation(formFields, validationRules);
                let validationReguls = validationRules[validationRulesName].validation;

                if (inp) {
                    if (inp.getAttribute('data-group')) {

                        if (isgroup) {
                            let fieldValue = validation(formFields);

                            for (let validationRegulName in validationReguls) {
                                let validationFunction = validators[validationRegulName];
                                let validOption = validationReguls;
                                let validationResult = validationFunction(fieldValue, validOption);
                                if (!validationResult.valid) {
                                    showErrors(validationResult, errorWrapper);
                                };
                            };
                        };
                    };
                    if (inp === formFields[0]) {
                        errorWrapper.textContent = '';

                        for (let validationRegulName in validationReguls) {

                            let validationFunction = validators[validationRegulName];
                            let validOption = validationReguls;
                            let validationResult = validationFunction(fieldValue, validOption);
                            if (!validationResult.valid) {
                                showErrors(validationResult, errorWrapper);
                                formFields[0].classList.add('invalid');
                                formFields[0].classList.remove('valid');
                            } else {
                                formFields[0].classList.add('valid');
                                formFields[0].classList.remove('invalid');
                            };
                        };
                    };
                } else if (!inp) {
                    errorWrapper.textContent = '';

                    for (let validationRegulName in validationReguls) {

                        let validationFunction = validators[validationRegulName];
                        let validOption = validationReguls;
                        let validationResult = validationFunction(fieldValue, validOption);
                        if (!validationResult.valid) {
                            showErrors(validationResult, errorWrapper);
                            if (formFields[0].type !== 'radio' && formFields[0].type !== 'checkbox') {
                                formFields[0].classList.add('invalid');
                                formFields[0].classList.remove('valid');
                            };
                        } else {
                            if (formFields[0].type !== 'radio' && formFields[0].type !== 'checkbox') {
                                formFields[0].classList.add('valid');
                                formFields[0].classList.remove('invalid');
                            };
                        };

                    };
                };
            };
        };

        let showErrors = function (validationResult, errorWrapper) {
            if (errorWrapper.textContent === '') {
                errorWrapper.textContent = validationResult.message;
            };
        };

        let validation = function ($field, validationRules) {

            let value = [];
            if ('number' === typeof $field.length) {
                for (let i = 0; i < $field.length; i++) {
                    let f = $field[i];
                    if (isRadioOrCheckbox($field[i])) {
                        if (f.checked) {
                            value.push(f.value);
                        }
                    } else {
                        value.push(f.value);
                    }
                };
            } else {
                value.push($field.value);
            }
            return value;
        };

        let onSubmit = function (e) {

            getValidation();
            let errorWrappers = document.querySelectorAll('.error-wrapper');
            errorWrappers.forEach(field => {
                if (field.textContent !== '') {
                    e.preventDefault();
                };
            });

            let err = document.querySelector('.invalid');
            if (err) {

                err.focus();
            };
        };
        let onBlur = function () {
            let errorWrapper = getErrorWrapper(this);
            errorWrapper.textContent = '';
            let fieldValue = validation(this, validationRules);
            getValidation(this);
        };
        let onClick = function () {
            let errorWrapper = getErrorWrapper(this);
            errorWrapper.textContent = '';
            getValidation(this);
        };
        $form.addEventListener('submit', onSubmit);
        addEventForFields();
    };

    let init = function () {
        let validationRules = {
            name: {
                validation: {
                    notBlank: {},
                    regex: /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/
                }
            },
            email: {
                validation: {
                    notBlank: {},
                    regex: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
                }
            },
            phone: {
                validation: {
                    notBlank: {},
                    regex: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
                    correctLength: 9

                }
            },
            client: {
                validation: {
                    notBlank: {}
                }
            },
            contactday: {
                group: true,
                validation: {
                    quantityChecked: {}
                }
            },
            message: {
                validation: {
                    notBlank: {}
                }
            },
            approval: {
                validation: {
                    notBlank: {}
                }
            }
        };
        let formName = 'contactform';
        let $form = document.querySelector(".contact-form");

        validationFormWrapper($form, formName, validationRules);
    };

    init();
}());