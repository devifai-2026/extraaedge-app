// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix: react-native-calendars ships src/index.ts as main entry point, but Metro
// sometimes cannot resolve extensionless imports (e.g. './calendar-list/new')
// from within TypeScript source files in node_modules on certain platforms.
const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Intercept the problematic react-native-calendars imports that have no extension
  if (
    moduleName === './calendar-list/new' ||
    moduleName === './expandableCalendar/WeekCalendar/new'
  ) {
    const filePath = path.resolve(
      path.dirname(context.originModulePath),
      `${moduleName}.js`
    );
    return { type: 'sourceFile', filePath };
  }

  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
