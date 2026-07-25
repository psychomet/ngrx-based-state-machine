module.exports = {
  '{packages,tools}/**/*.{ts,js,json,md,html,css,scss,less}': [
    () => 'nx format:write --uncommitted --libs-and-apps',
  ],
};
