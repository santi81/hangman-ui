sap.ui.define(
	["jquery.sap.global",
		"sap/m/Button",
		"sap/ui/layout/form/SimpleForm", "sap/m/VBox", "sap/m/HBox", "sap/m/Label", "sap/m/Input", "sap/m/List",
		"sap/m/StandardListItem", "sap/ui/unified/FileUploader", "sap/m/MessageToast", "sap/ui/core/mvc/Controller",
		"sap/ui/model/json/JSONModel", 'sap/m/MessageBox', 'sap/ui/core/Fragment'
	],
	function (jQuery, Button, SimpleForm, VBox, HBox, Label, Input, List, StandardListItem,
			FileUploader, MessageToast, Controller, JSONModel,  MessageBox, Fragment) {
		"use strict";
		var _timeout;
		var uploadedData = "";

		var loginPageController = Controller.extend(
			"hangman.controller.gamepage", {

				/**
				 * Called when a controller is
				 * instantiated and its View controls
				 * (if available) are already created.
				 * Can be used to modify the View before
				 * it is displayed, to bind event
				 * handlers and do other one-time
				 * initialization.
				 * 
				 * @memberOf sap-ui5-poc.loginpage
				 */
				onInit: function () {
//					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//					oRouter.getRoute("gamepage").attachMatched(this._onRouteMatched, this);


				},

				onBeforeRendering: function () {
//					var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
//					oRouter.getRoute("gamepage").attachMatched(this._onRouteMatched, this);
                    try {
                         //Enable Input field and Button
                        this.getView().byId("idChar").setProperty("editable", false)
                        this.getView().byId("idSubmit").setProperty("enabled", false)
                        var game_id = window.location.href.split("/")[4]
                        if (game_id){
                            this.getGameData(game_id)
                        }
                    }
                    catch (oException) {
                        //Game not started yet
                    }

				},

				_validateInput: function(oInput) {
                    var oBinding = oInput.getBinding("value");
                    var sValueState = "None";
                    var bValidationError = false;

                    try {
                        oBinding.getType().validateValue(oInput.getValue());
                    } catch (oException) {
                        sValueState = "Error";
                        bValidationError = true;
                    }

                    oInput.setValueState(sValueState);

                    return bValidationError;
                },

				createNewGame: function (oEvent) {
					var that = this;
					alert("Yayy New game")
					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: '/hangman/new-game',
                                dataType: "json",
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    //redirect to a URL

                                    var new_url = window.location.href.split("hangman")[0] +'hangman/'+ data.game_id
                                    window.location.replace(new_url);


                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    var error = JSON.parse(JSON.stringify(jqXHR.responseJSON)).message;
                                    if(error == 'VALUE_ERROR') {
                                        sap.ui.core.BusyIndicator.hide();
                                        MessageToast.show("Error. Please contact technical support!");
                                    }
                                }
                            })


				},
                getGameData: function(game_id){
                    var that = this;
					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "GET",
                                contentType: "application/json",
                                url: '/hangman/game-status?game_id='+game_id,
                                dataType: "json",
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    var oModelGuesses = new sap.ui.model.json.JSONModel();
                                    var guesses_data, word_data, char_count, list_char
                                    guesses_data = {}
                                    guesses_data["num_guesses_left"] = data.guesses.num_guesses_left
//                                    guesses_data["wrong_guesses"]=["O", "I","E"]
                                    guesses_data["wrong_guesses"]=[]
                                    oModelGuesses.setData(guesses_data);
                                    sap.ui.core.BusyIndicator.hide();
                                    var idGuesses = that.byId("idGuesses");
                                    idGuesses.setModel(oModelGuesses);

                                    //new word
                                    char_count = data.status.total_chars
                                    list_char = Array(char_count).join(".").split(".");
                                    word_data= {"word": list_char}
                                    var oModelWord = new sap.ui.model.json.JSONModel();
                                    oModelWord.setData(word_data)
                                    var idWord= that.byId("idWord");
                                    idWord.setModel(oModelWord);

                                    var oModelCurrentGuess = new sap.ui.model.json.JSONModel();
                                    oModelCurrentGuess.setData({"char": ""})
                                    var idChar= that.byId("idChar");
                                    idChar.setModel(oModelCurrentGuess);

                                    //Enable Input field and Button
                                    that.getView().byId("idChar").setProperty("editable", true)
                                    that.getView().byId("idSubmit").setProperty("enabled", true)

                                    //Set GameID to controller
                                    that.game_id = data.game_id

                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Error. Please contact technical support!");
                                }
                            })

                },
				submitGuess: function(oEvent){
				    var that = this;
			        var oView = this.getView();
			        var oInputChar = oView.byId("idChar")
			        var bValidationError = false;
                    var guessed_char = oInputChar.getValue()
                    // check that input are not empty
                    bValidationError = that._validateInput(oInputChar) || bValidationError;

                    // output result
                    if (bValidationError) {
                        return MessageBox.alert("Please enter 1 Character");
                    }

					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "PUT",
                                contentType: "application/json",
                                url: '/hangman/submit-guess?game_id='+that.game_id,
                                dataType: "json",
                                data:{guessed_char},
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    var guesses_data, word_data, char_count, list_char
                                    guesses_data = {}
                                    guesses_data["num_guesses_left"] = data.guesses.num_guesses_left
                                    guesses_data["wrong_guesses"]= data.status.wrong_guesses
                                    var idGuesses = that.byId("idGuesses");
                                    var oModelGuesses = idGuesses.getModel();
                                    oModelGuesses.setData(guesses_data);
                                    // idGuesses.setModel(oModelGuesses);

                                    //new word

                                    word_data= {"word": data.status.word}
                                    var idWord= that.byId("idWord");
                                    var oModelWord = idWord.getModel();
                                    oModelWord.setData(word_data)


                                    var idChar= that.byId("idChar");
                                    var oModelCurrentGuess = idChar.getModel();
                                    oModelCurrentGuess.setData({"char": ""})

                                    sap.ui.core.BusyIndicator.hide();

                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show("Error. Please contact technical support!");
                                }
                            })

				}

			});
		return loginPageController;
	});