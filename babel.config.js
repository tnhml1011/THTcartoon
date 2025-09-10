module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins:[
    ['react-native-reanimated/plugin'],
    [
      "module:react-native-dotenv",
      {
        "moduleName": "@env",
        "path": "./mux-TNHToon.env",
        "safe": false,
        "allowUndefined": true
      }
    ]
  ]
};
