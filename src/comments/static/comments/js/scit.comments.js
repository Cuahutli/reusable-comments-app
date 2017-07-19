 $(document).ready(function(){
    var endpoint = 'http://localhost:8000/api/comments/'
    var dataUrl = $('.load-comments').attr('data-url')

    $.ajax({
        methos: "GET",
        url: endpoint,
        data:{
            url: dataUrl,
        }, 
        success: function(data){
            //console.log(data)
            $.each(data, function(index, object){
                $('.load-comments').append("<li>" + object.content + "</li>")
            })
        },
        error: function(data){
            console.log('error')
            console.log(data)
        },
    })
})