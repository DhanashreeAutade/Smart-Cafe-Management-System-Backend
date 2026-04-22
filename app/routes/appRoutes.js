var appRouter = new Object();
appRouter.initialize = function(app) {

    var roleRoutes = require('./roleRoutes');
    app.use('/roles', roleRoutes);
};
module.exports = appRouter;