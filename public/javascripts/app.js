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

    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
      };

    /*
     * Define Contact Model
     */

    var Contact = Backbone.Model.extend({
        defaults: {
            photo: "../images/placeholder.png"
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
        },

        render: function () {
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
        }
    });

    //create instance of master view
    var directory = new DirectoryView();

} (jQuery));