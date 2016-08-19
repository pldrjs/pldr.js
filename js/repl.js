var _$ = new JavaImporter(
	java.lang,
	Packages.cn.nukkit.command,
	Packages.cn.nukkit.utils
);

var __$;

try{
	__$ = new JavaImporter(
		javafx.application,
		javafx.scene,
		javafx.scene.control,
		javafx.scene.layout
	);

	var thiz = this;

	var mApplication = Java.extend(Java.type("javafx.application.Application"), {
		start: function(stg){
			PldrJS.GUIEnabled = true;
			PldrJS.Stage = stg;
		}
	});

	new _$.Thread(() => {
		try{
			__$.Application.launch(mApplication.class);
		}catch(e){
			PldrJS.GUIEnabled = false;
		}
	}).start();
}catch(e){
	PldrJS.GUIEnabled = false;
}

PldrJS.registerCommand('repl', 'Starts REPL Mode.', '/repl');
PldrJS.command('repl', function(command, sender, label, args){
	if(!(sender instanceof _$.ConsoleCommandSender)){
		sender.sendMessage(_$.TextFormat.RED + 'Please run this command in console');
		return;
	}

	if(!PldrJS.GUIEnabled){
		sender.sendMessage(_$.TextFormat.RED + 'You cannot use gui!');
		return;
	}

	var statementArea, resultArea;

	__$.Platform.runLater(() => {
		statementArea = new __$.TextArea();
		statementArea.setPrefColumnCount(50);
		statementArea.setPrefRowCount(30);
		statementArea.setPromptText("Enter statement here...");

		resultArea = new __$.TextArea();
		resultArea.setPrefColumnCount(50);
		resultArea.setPrefColumnCount(10);
		resultArea.setEditable(false);
		resultArea.setStyle("-fx-opacity: 1.0;");

		var evalButton = new __$.Button("Evaluate");
		evalButton.setMaxWidth(_$.Double.MAX_VALUE);
		evalButton.setOnAction(() => {
			new _$.Thread(() => {
				var startTime = Date.now();
				var value = (new Function(statementArea.getText())).apply(thiz, []);
				var elapsedTime = Date.now() - startTime;
				__$.Platform.runLater(() => {
					resultArea.setText(value + "\nElapsed Time : " + elapsedTime + "ms");
				});
			}).start();
		});

		var cc = new __$.ColumnConstraints();
		cc.setFillWidth(true);
		cc.setHgrow(__$.Priority.ALWAYS);

		var rc = new __$.RowConstraints();
		rc.setFillHeight(true);
		rc.setVgrow(__$.Priority.ALWAYS);

		var rootPane = new __$.GridPane();
		rootPane.getColumnConstraints().add(cc);
		rootPane.getRowConstraints().add(rc);
		rootPane.add(new __$.Label("Statement"), 0, 0);
		rootPane.add(statementArea, 0, 1);
		rootPane.add(evalButton, 0, 2);
		rootPane.add(resultArea, 0, 3);

		var scene = new __$.Scene(rootPane);
		PldrJS.Stage.setScene(scene);
		PldrJS.Stage.setTitle("REPL");
		PldrJS.Stage.show();
	});
});
