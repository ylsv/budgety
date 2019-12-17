// BUDGET CONTROLLER
const BudgetController = (() => {
	
	class Expense {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}
	}
 
	class Income {
		constructor(id, description, value) {
			this.id = id;
			this.description = description;
			this.value = value;
		}
	}
	
	const data = {
		allItems: {
			exp: [],
			inc: [],
		},
		totals: {
			exp: 0,
			inc: 0,
		}		
	};

	return {
		addItem: (type, desc, val) => {
			let newItem, ID;

			// create new id
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// create new item
			if (type === 'exp'){
				newItem = new Expense(ID, desc, val);
			} else if (type === 'inc'){
				newItem = new Income(ID, desc, val);
			}

			// push it into our data structure
			data.allItems[type].push(newItem);

			// return the new element
			return newItem;
		},
		testing: function() {
			console.log(data);
		}
	}
})();


// UI CONTROLLER
const UIController = (() => {

	const DOMStrings = {
		inputType: '.add__type',
		inputDesc: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
	}

	return {
		getInput: () => {
			return {
				type: document.querySelector(DOMStrings.inputType).value, // will be inc or exp
				description: document.querySelector(DOMStrings.inputDesc).value,
				value: document.querySelector(DOMStrings.inputValue).value,
			};
		},

		addListItem: (obj, type) => {
				// create html string with placeholder text
				let html, newHtml, element;

				if(type === 'inc'){
					element = DOMStrings.incomeContainer;

					html = 
					`
					<div class="item clearfix" id="income-%id%">
						<div class="item__description">%description%</div>
						<div class="right clearfix">
							<div class="item__value">%value%</div>
							<div class="item__delete">
									<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
							</div>
						</div>
					</div>
					`
				} else if (type === 'exp') {
					element = DOMStrings.expensesContainer;

					html =
					`
					<div class="item clearfix" id="expense-%id%">
						<div class="item__description">%description%</div>
						<div class="right clearfix">
								<div class="item__value">%value%</div>
								<div class="item__percentage">21%</div>
								<div class="item__delete">
										<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
								</div>
						</div>
					</div>
					` 
				}

				// replace placeholder text with actual data
				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', obj.value);

				// insert html into the dom
				document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		clearFields: () => {
			let fields, fieldsArr;
			fields = document.querySelectorAll(DOMStrings.inputDesc + ', ' + DOMStrings.inputValue);
			fieldsArr = Array.from(fields);
			fieldsArr.forEach((i) => {
				i.value = '';
			});
			fieldsArr[0].focus();
		},

		getDOMStrings: () => {
			return DOMStrings;
		}
	};

})();



// GLOBAL APP CONTROLLER
const Controller = ((budgetCtrl, UIctrl) => {

	const setupEvetnListeners = () => {
		const DOM = UIctrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', (e) => {
			if(e.keyCode === 13 || e.which === 13) {
				ctrlAddItem();
			}
		});
	};

	const ctrlAddItem = () => {
		
		// 1. Get the field input data
		const input = UIctrl.getInput();
	
		// 2. Add the item to the budget controller
		const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
	
		// 3. Add the item to the UI
		UIctrl.addListItem(newItem, input.type);

		// 4. Clear the fields
		UIctrl.clearFields();
	
		// 5. Calculate the budget
	
		// 6. Display the budget on the UI

	};

	return {
		init: () => {
			console.log('app started')
			setupEvetnListeners();
		}
	}

})(BudgetController, UIController); 

Controller.init();