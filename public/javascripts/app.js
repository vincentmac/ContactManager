(function ($) {
    //demo data
    var contacts = [
        { name: "Contact 1", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 2", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 3", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 4", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 5", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" },
        { name: "Contact 6", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "colleague" },
        { name: "Contact 7", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "friend" },
        { name: "Contact 8", address: "1, a street, a town, a city, AB12 3CD", tel: "0123456789", email: "anemail@me.com", type: "family" }
    ];

    // This lets jade and underscore play nicely
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
      };

    /*
     * Define Contact Model
     */

    var Contact = Backbone.Model.extend({
        defaults: {
            photo:      "../images/placeholder.png",
            name:       "",
            address:    "",
            tel:        "",
            email:      "",
            type:       ""
        }
    });

    /*
     * Define Directory Collection
     */

    var Directory = Backbone.Collection.extend({
        model: Contact
    });

    /*
     * Define Individual Contact View
     */
    
    var ContactView = Backbone.View.extend({
        tagName: "article",  // defines the container type (ie div, li, ...)
        className: "contact-container",  // adds a class type to the new container
        template: $("#contactTemplate").html(),  // uses jQuery to store a cached reference the html contents of the template

        render: function () {
            var tmpl = _.template(this.template);
            
            this.$el.html(tmpl(this.model.toJSON()));
            return this;
        },

        events: {
            "click button.delete": "deleteContact"
        },

        // Delete Contact Event Handler
        deleteContact: function () {
            var removedType = this.model.get("type").toLowerCase();

            // Remove Model (individual contact view)
            this.model.destroy();

            // Remove view from page
            this.remove();

            // Re-render select if no more of deleted type
            if(_.indexOf(directory.getTypes(), removedType) === -1) {
                directory.$el.find("#filter select").children("[value='" + removedType + "']").remove();
            }
        }
        
    });

    /*
     * Define Master View
     */

    var DirectoryView = Backbone.View.extend({
        el: $("#contacts"),  // sets what existing element to attach the view to.

        initialize: function () {
            this.collection = new Directory(contacts);

            this.render();
            this.$el.find("#filter").append(this.createSelect());

            // Bind callback function to UI events
            this.on("change:filterType", this.filterByType, this); // the "this" context refers to master view (DirectoryView)
            this.collection.on("reset", this.render, this);
            this.collection.on("add", this.renderContact, this);
            this.collection.on("remove", this.removeContact, this);
        },

        render: function () {
            this.$el.find("article").remove();

            var that = this;
            _.each(this.collection.models, function (item) {
                that.renderContact(item);
            }, this);
        },

        renderContact: function (item) {
            var contactView = new ContactView({
                model: item
            });
            this.$el.append(contactView.render().el);
        },

        getTypes: function () {
            return _.uniq(this.collection.pluck("type"), false, function (type) {
                return type.toLowerCase();
            });
        },

        createSelect: function() {
            // var filter = this.el.find("#filter"),
            var select = $("<select/>", {
                    html: "<option value='all'>All</option>"
                });

            _.each(this.getTypes(), function (item) {
                var option = $("<option/>", {
                    value: item.toLowerCase(),
                    text: item.toLowerCase()
                }).appendTo(select);
            });
            return select;
            console.log(select);
        },

        // Add UI events
        events: {
            "change #filter select": "setFilter",
            "click #add": "addContact",
            "click #showForm": "showForm"
        },

        // Set filter property and fire change event
        setFilter: function (e) {
            this.filterType = e.currentTarget.value;
            this.trigger("change:filterType");
        },

        // Filter the view
        filterByType: function () {
            if (this.filterType === "all") {
                this.collection.reset(contacts);
                contactsRouter.navigate("filter/all");
            } else {
                this.collection.reset(contacts, { silent: true });

                var filterType = this.filterType,
                    filtered = _.filter(this.collection.models, function (item) {
                        return item.get("type").toLowerCase() === filterType;
                    });

                this.collection.reset(filtered);

                contactsRouter.navigate("filter/" + filterType);  // update addressbar URL
            }
        },

        // Add a new contact event
        addContact: function (e) {
            e.preventDefault();

            var formData = {};  // note: the tutorial has a typo here and uses newModel
            $("#addContact").children("input").each(function (i, el) {
                if ($(el).val() !== "") {
                    formData[el.id] = $(el).val();  // same newModel typo
                }
            });

            // update data store.
            contacts.push(formData);

            // Re-render the select filter if new type in unknown
            if (_.indexOf(this.getTypes(), formData.type) === -1) {
                this.collection.add(new Contact(formData));
                // update filter to include new type
                this.$el.find("#filter").find("select").remove().end().append(this.createSelect());
            } else {
                this.collection.add(new Contact(formData));
            }
        },

        removeContact: function (removedModel) {
            var removed = removedModel.attributes;

            // If model acquired default photo property, remove it
            if (removed.photo === "../images/placeholder.png") {
                delete removed.photo;
            }

            _.each(contacts, function (contact) {
                if (_.isEqual(contact, removed)) {
                    contacts.splice(_.indexOf(contacts, contact), 1);
                }
            });
        },

        showForm: function() {
            this.$el.find("#addContact").slideToggle();
        }

    });

    /*
     * Routers
     */

    var ContactsRouter = Backbone.Router.extend({
        routes: {
            "filter/:type": "urlFilter"  // This creates a new routes localhost/#filter/family
        },

        urlFilter: function (type) {
            directory.filterType = type;
            directory.trigger("change:filterType");
        }
    });

    // Create instance of master view
    var directory = new DirectoryView();

    // Create router instance
    var contactsRouter = new ContactsRouter();

    // Start history service - this allows us to rewrite the url after the # and monitor changes
    Backbone.history.start();

} (jQuery));