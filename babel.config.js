module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // [
    //   '@babel/plugin-transform-private-methods',
    //   {
    //     loose: true,
    //   }
    // ],
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '^@/(.+)': './src/\\1',
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
