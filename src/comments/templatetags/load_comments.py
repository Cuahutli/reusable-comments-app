from django import template
#from django.utils.html import conditional_escape
#from django.utils.safestring import mark_safe

register = template.Library()

from comments.models import Comment

@register.inclusion_tag('comments/comments-loader.html')
def load_comments(url):
    qs = Comment.objects.filter(url=url)
    return {'comments': qs}

