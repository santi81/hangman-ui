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
					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: '/api/createGame/',
                                dataType: "json",
                                data: JSON.stringify({}),
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    //redirect to a URL

                                    var new_url = window.location.href.split("hangman")[0] +'hangman/'+ data.game_id
                                    window.location.replace(new_url);


                                },
                                error: function(jqXHR, textStatus, errorThrown) {
                                      sap.ui.core.BusyIndicator.hide();
                                      MessageToast.show("Error. Please contact technical support!");

                                }
                            })


				},
                getGameData: function(game_id){
                    var that = this;
					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "GET",
                                contentType: "application/json",
                                url: '/api/retrieveGame/'+game_id,
                                dataType: "json",
                                async: true,
                                success: function(data, textStatus, jqXHR) {
                                    var oModelGuesses = new sap.ui.model.json.JSONModel();
                                    var guesses_data, word_data, char_count, list_char
                                    guesses_data = {}
                                    guesses_data["num_guesses_left"] = data.guesses.num_guesses_left
                                    guesses_data["wrong_guesses"]=data.status.wrong_guesses
                                    oModelGuesses.setData(guesses_data);
                                    sap.ui.core.BusyIndicator.hide();
                                    var idGuesses = that.byId("idGuesses");
                                    idGuesses.setModel(oModelGuesses);

                                    //new word
                                    word_data= {"word": data.status.word}
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

                                    //Set GameID to controller and update used_char array
                                    that.game_id = data.game_id
                                    that.used_char = data.status.wrong_guesses
                                    that.used_char.push.apply(that.used_char,data.status.word)

                                    if (data.status.game_over === true){
                                        MessageBox.information("Game is over!", {title: "Game Over"})

                                        //Disable Input field and Button
                                        that.getView().byId("idChar").setProperty("editable", false)
                                        that.getView().byId("idSubmit").setProperty("enabled", false)
                                    }

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
                        return MessageBox.error("Please enter 1 Character");
                    }

                    //Convert to Upper case
                    guessed_char = guessed_char.toUpperCase();

                    //Check for Used Characters
                    if (that.used_char.indexOf(guessed_char) != -1){
                        //Clear guessed char
                        var idChar= that.byId("idChar");
                        var oModelCurrentGuess = idChar.getModel();
                        oModelCurrentGuess.setData({"char": ""})
                        return MessageBox.error(guessed_char + " is used. Make a new guess");
                    }

					sap.ui.core.BusyIndicator.show();
					var aData = jQuery.ajax({
                                type: "POST",
                                contentType: "application/json",
                                url: '/api/submitGuess/',
                                dataType: "json",
                                data:JSON.stringify({"game_id": that.game_id, "guess": guessed_char}),
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

                                    //Update used_char array
                                    that.used_char = data.status.wrong_guesses
                                    that.used_char.push.apply(that.used_char,data.status.word)

                                    sap.ui.core.BusyIndicator.hide();

                                    if (data.status.game_over === true){
                                        if (data.guesses.num_guesses_left > 0) {
                                            MessageBox.success("You Won the Game!", {title: "Game Won"})
                                        }
                                        else{
                                            MessageBox.error("You Lost the Game. Try Again", {title: "Game Lost"})
                                        }
                                    //Disable Input field and Button
                                    that.getView().byId("idChar").setProperty("editable", false)
                                    that.getView().byId("idSubmit").setProperty("enabled", false)
                                    }


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