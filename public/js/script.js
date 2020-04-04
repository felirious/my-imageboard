console.log("sanity check!!");

(function() {
    Vue.component("image-modal", {
        template: "#image-modal",
        props: ["id"],
        data: function() {
            return {
                comments: [],
                title: "",
                description: "",
                username: "",
                comment: "",
                url: "",
                lastImageID: ""
            };
        }, /////////////////////////////// data ends ///////////////////////////
        mounted: function() {
            // console.log("hi I'm a component lifecycle function");
            // console.log("id in component: ", this.id);
            var me = this;
            axios
                .get(`/image-info/${this.id}`)
                .then(response => {
                    // console.log("response received");
                    // console.log(
                    //     "this is what the response looks like: ",
                    //     response
                    // );
                    me.id = response.data[0].id;
                    me.url = response.data[0].url;
                    me.username = response.data[0].username;
                    me.title = response.data[0].title;
                    me.description = response.data[0].description;
                })
                .catch(err => {
                    console.log("error in axios request: ", err);
                });
            axios
                .get(`/user-comments/${this.id}`)
                .then(response => {
                    // console.log("comments response: ", response);
                    me.comments = response.data;
                    // console.log("me.comments: ", me.comments);
                })
                .catch(err => {
                    console.log("error in comments fetch: ", err);
                });
        }, ////////////////////////////// mounted ends /////////////////////////
        methods: {
            handleSubmitComment(e) {
                e.preventDefault();
                var me = this;
                var comments = {
                    username: this.username,
                    comment: this.comment,
                    id: this.id
                };
                axios
                    .post("/user-comments", comments)
                    .then(function(response) {
                        // console.log("response in comments: ", response);
                        me.comments.unshift(response.data[0]);
                    })
                    .catch(err => {
                        console.log("err in POST /comments: ", err);
                    });
            },
            sendMessage: function() {
                this.$emit("close");
            }
        }
    });
    new Vue({
        el: "#main",
        data: {
            cards: [],
            comments: [],
            title: "",
            description: "",
            username: "",
            file: null,
            id: location.hash.slice(1),
            smallestOnscreenID: 100,
            more: null
        }, // //////////////////////////// data ends ///////////////////////////
        // kinda like on pageload event-handler
        mounted: function() {
            addEventListener("hashchange", function() {
                this.id = location.hash.slice(1);
            });
            // console.log("My vue component has loaded!");
            var that = this;
            axios
                .get("/cards")
                .then(function(response) {
                    // console.log("hi");
                    that.cards = response.data;
                    // console.log("response from /cards: ", response.data);
                    that.smallestOnscreenID =
                        that.cards[that.cards.length - 1].id;
                    console.log(
                        "smallestID at initial load: ",
                        that.smallestOnscreenID
                    );
                    // console.log("cards: ", that.cards);
                    that.more = true;
                })
                .catch(err => {
                    console.log("error in initial get request: ", err);
                });
            addEventListener("hashchange", function() {
                that.id = location.hash.slice(1);
            });
        }, // ////////////////////////////// mounted ends //////////////////////
        watch: {
            id: function() {
                // console.log("hi");
                // do the same thing as in mounted
            }
        },
        methods: {
            handleSubmit: function(e) {
                // prevent button from triggering page refresh
                e.preventDefault();
                // console.log("this!", this);
                // this refers to the vue instance / its data
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);
                var me = this;
                axios
                    .post("/upload", formData)
                    .then(function(resp) {
                        // console.log("me: ", me);
                        // console.log("this: ", resp);
                        me.cards.unshift(resp.data[0]);
                    })
                    .catch(err => {
                        console.log("err in POST /upload: ", err);
                    });
            },
            handleChange: function(e) {
                // console.log("handleChange is running!");
                // console.log("selected file: ", e.target.files[0]);
                this.file = e.target.files[0];
            },
            handleImageClick: function(imageID) {
                this.id = imageID;
                // console.log("this.id: ", this.id);
            },
            closeModal: function() {
                this.id = null;
                location.hash = "";
            },
            loadMoreImages: function(e) {
                e.preventDefault();
                var that = this;
                console.log(
                    "smallestOnscreenID in more: ",
                    that.smallestOnscreenID
                );
                axios
                    .get(`/more/${that.smallestOnscreenID}`)
                    .then(response => {
                        console.log("hi");
                        console.log("response data on /more: ", response.data);
                        that.cards.push(...response.data);
                        console.log(
                            "**onscreen und lowest from db****: ",
                            that.smallestOnscreenID,
                            response.data[0].lowestID
                        );
                        // console.log("that.cards: ", that.cards);
                        that.smallestOnscreenID =
                            that.cards[that.cards.length - 1].id;
                        console.log(
                            "**onscreen und lowest after reset****: ",
                            that.smallestOnscreenID,
                            response.data[0].lowestID
                        );
                        if (
                            that.smallestOnscreenID == response.data[0].lowestID
                        ) {
                            that.more = null;
                        }
                    })
                    .catch(err => {
                        console.log("error in load-more-results: ", err);
                    });
            }
        }
    });
})();
