function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
} 
$(document).ready(function(){
    var endpoint = $('.scit-load-comments').attr('data-api-endpoint') || "/api/comments/"
    var dataUrl = $('.scit-load-comments').attr('data-url')
    var loginUrl = $('.scit-load-comments').attr('data-login') || '/accounts/login/'
    var isUser = false;
    var authUsername;
    $(".scit-load-comments").after("<div class='form-container'></div>")

    getComments(dataUrl)
    
    function renderCommentLine(object) {
        var authorImage =  "<div class='media-left'> " +
                            "<a href='#'>" +
                            "<img class='media-object scit-user-image' src='" + object.image + "' alt='...'>" +
                            "</a></div>"
        var author = '';
        if (object.user) {
            author ="<small>" + object.user.username  + "</small>"
        }
        var timestamp = new Date(object.timestamp) .toLocaleString();
        var htmlStart = "<div class='media scit-media'>" + authorImage + "<div class='media-body'>" + 
                    "<p class='scit-media-content' data-id='" + object.id + "'>" + object.content + "</p>" + author + "<small> on " + timestamp
        if(object.user){
            if (object.user.username === authUsername){
                htmlStart = htmlStart + ' | <a href="#" class="scit-media-edit">Editar</a>'
            }
        }
        var html_ = htmlStart + "</small></div></div>"
        return html_
    }

    function getComments(requestUrl){
        isUser = $.parseJSON(getCookie('isUser'));
        authUsername =String(getCookie('authUsername'));
        $(".scit-load-comments").html('<h3> Comments</h3>')
        $.ajax({
            methos: "GET",
            url: endpoint,
            data:{
                url: requestUrl,
            }, 
            success: function(data){
                if (data.length > 0){
                    $.each(data, function(index, object){
                        $('.scit-load-comments').append(renderCommentLine(object))
                    })
                }
                var formHtml = generateForm()
                $(".form-container").html(formHtml)
                //$(".scit-load-comments").after(formHtml)
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
        if (isUser){
            return html_
        }else{
            return "<div class='text-center login-requerido'><a href='" + loginUrl + "'>Necesitas estar logueado para comentar</a></div>"
        }               
        
    }

    function formtarErrorMsg(jsonResponse) {  
        var message = "";  
        $.each(jsonResponse, function (key, value) {
            if (key == 'detail' || key == 'content'){
                message += value + "<br/>"
            }else{
                message += key + ": " + value + "<br/>"
            }
        })
        var formattedMsg = '<div class="scit-alert alert alert-danger alert-dismissible" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                        message +
                        '</div>'
        return formattedMsg            
    }

    function handleForm(formData) {
        console.log(formData)
        $.ajax({
            url: endpoint + "create/",
            method: "POST",
            data: formData + "&url=" + dataUrl,
            success: function (data) {
                console.log(data)
                //getComments(dataUrl)
                $('.scit-load-comments').append(renderCommentLine(data))
                var formHtml = generateForm()
                $('.form-container').html(formHtml)
            } ,
            error: function(data){
                console.log("error")
                console.log(data.responseJSON)
                var formErrorExists = $('.scit-alert')
                if (formErrorExists){
                    formErrorExists.remove()
                }
                var msg = formtarErrorMsg(data.responseJSON)
                $(".comment-form textarea").before(msg)
            }
        })
    }

    $(document).on('submit', '.comment-form', function(e){
        e.preventDefault()
        var formData = $(this).serialize()
        handleForm(formData)
    })

    // Editar el comentario Inline de aqui para abajo
    $(document).on('click', '.scit-media-edit', function (e) {
        e.preventDefault  
        $(this).fadeOut()
        var contentHolder = $(this).parent().parent().find('.scit-media-content')
        var contentTxt = contentHolder.text()
        var objectId = contentHolder.attr('data-id')
        $(this).after(generateEditForm(objectId, contentTxt))
    })

    $(document).on('submit', '.comment-edit-form', function(e){
        e.preventDefault()
        var formData = $(this).serialize()
        var objectId = $(this).attr('data-id')
        handleEditForm(formData, objectId)
    })

    $(document).on('click', '.comment-delete', function(e){
        e.preventDefault()
        var dataId = $(this).parent().attr('data-id')
        $.ajax({
            method: "DELETE",
            url: endpoint + dataId + "/",
            success: function () {
                getComments(dataUrl)
            }

        })
    })

      $(document).on('click', '.comment-edit-cancel', function(e){
        e.preventDefault()
        $(this).parent().parent().parent().find('.scit-media-edit').fadeIn()
        $(this).parent().remove()
    })

    function generateEditForm(objectId, content){
        var html_ = "<form method='POST' class='comment-edit-form' data-id='" + objectId + "'>" +
                    "<textarea class='form-control' placeholder='Tu comentario...' name='content'>" + content + "</textarea>" +
                    "<input class='btn btn-default' type='submit' value='Guardar Cambios'>" +
                    "<button class='btn btn-link comment-edit-cancel'>Cancelar</button>" +
                    "<button class='btn btn-danger comment-delete'>Borrar</button>" +
                    "<br/></form>"
        return html_
    }

    function handleEditForm(formData, objectId) {
        $.ajax({
            url: endpoint + objectId + "/",
            method: "PUT",
            data: formData ,
            success: function (data) {
                getComments(dataUrl)
            } ,
            error: function(data){
                console.log("error")
                console.log(data.responseJSON)
                var msg = formtarErrorMsg(data.responseJSON)
                $("[data-id='" + objectId + "'] textarea").before(msg)
            }
        })
    }
})

