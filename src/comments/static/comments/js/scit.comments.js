 $(document).ready(function(){
    var endpoint = 'http://localhost:8000/api/comments/'
    var dataUrl = $('.load-comments').attr('data-url')
    $(".load-comments").after("<div class='form-container'></div>")

    getComments(dataUrl)

    function renderCommentLine(object) {
        var authorImage =  "<div class='media-left'> " +
                            "<a href='#'>" +
                            "<img class='media-object scit-user-image' src='" + object.image + "' alt='...'>" +
                            "</a></div>"
        var author = '';
        if (object.user) {
            author ="<small>" + object.user.username + "</small>"
        }
        var timestamp = new Date(object.timestamp) .toLocaleString();
        var html_ = "<div class='media scit-media'>" + authorImage + "<div class='media-body'>" + 
                    object.content + "<br/>" + author + "<small> on " + timestamp + "</small>" +
                    "</div></div>"
        return html_
    }

    function getComments(requestUrl){
        $(".load-comments").html('<h3> Comments</h3>')
        $.ajax({
            methos: "GET",
            url: endpoint,
            data:{
                url: requestUrl,
            }, 
            success: function(data){
                if (data.length > 0){
                    $.each(data, function(index, object){
                        $('.load-comments').append(renderCommentLine(object))
                    })
                }
                var formHtml = generateForm()
                $(".form-container").html(formHtml)
                //$(".load-comments").after(formHtml)
            },
            error: function(data){
                console.log('error')
                console.log(data)
            },
        })
    }

    function generateForm(){
        var html_ = "<form method='POST' class='comment-form'>" +
                    "<textarea class='form-control' placeholder='Tu comentario...' name='content'></textarea>" +
                    "<input class='btn btn-default' type='submit' value='Comment'></form>"
        return html_
    }

    function handleForm(formData) {
        console.log(formData)
        $.ajax({
            url: endpoint + "create/",
            method: "POST",
            data: formData + "&url=" + dataUrl,
            success: function (data) {
                console.log(data)
                getComments(dataUrl)
            } ,
            error: function(data){
                console.log("error")
                console.log(data)
            }
        })
    }
    $(document).on('submit', '.comment-form', function(e){
        e.preventDefault()
        var formData = $(this).serialize()
        handleForm(formData)
    })
})