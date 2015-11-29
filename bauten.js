/*
 * bauten.js - japanese-style text-emphasiser
 *
 * bauten - japanese-style text-emphasiser
 * Copyright (c) 2015 Koji Takami
 * Released under the MIT license
 * https://github.com/takamin/bauten/blob/master/LICENSE
 */
(function(d) {
    function bauten(style1, style2 /* , ... */) {
        bauten._push(bauten._styles, arguments);
    }
    bauten._push = function(dst, src) { Array.prototype.push.apply(dst, src); };
    bauten._each = function(a,f) { Array.prototype.forEach.call(a,f); };
    bauten._hasClass = function(e, c) {
        return e.className.split(' ').filter(function(s){return s!='';}).indexOf(c)>=0;
    };
    bauten._styles = [];
    bauten._styleIds = ['dot', 'circle', 'double-circle', 'triangle', 'sesame'];
    bauten.styleId2Ch = {
        'dot':          { 'open': 'o',  'filled': '・'},
        'circle':       { 'open': '○',  'filled': '●'},
        'double-circle':{ 'open': '◎',  'filled': '⦿'},
        'triangle':     { 'open': '△',  'filled': '▲'},
        'sesame':       { 'open': '﹆',  'filled': '﹅'}
    };
    bauten._regexIgnoredChars = /[\s　\(\)（）\[\]「」［］]/;
    bauten._applyAll = function(elements, style) {
        var emphasisChar = bauten._getEmphasisChar(style);
        if(emphasisChar != null) {
            elements.forEach(function(element) {
                bauten._applyElement(element, emphasisChar, style.color,
                        style.position);
            });
        }
    };
    bauten._getEmphasisChar = function(style) {
        var emphasisChar = null;
        var normStyle = bauten._parseStyle(style);
        if(normStyle.length == 1) {
            if(normStyle[0] != 'none') {
                emphasisChar = normStyle[0];
            }
        } else if(normStyle.length > 1) {
            var fill_style = normStyle[0];
            var char_style = normStyle[1];
            emphasisChar = bauten.styleId2Ch[char_style][fill_style];
        }
        return emphasisChar;
    }
    bauten._parseStyle = function(style) {
        var normStyle = null;
        var char_style = 'none';
        var fill_style = 'filled';
        var styles = styles = style.style.split(' ').filter(function(e) { return e != ''; });
        if(styles.length == 1) {
            char_style = styles[0];
        } else if(styles.length == 2) {
            fill_style = styles[0];
            char_style = styles[1];
        } else {
            throw '"' + style.style + '" is not recognized as text-emphasis-style';
        }
        if(bauten._styleIds.indexOf(char_style) < 0) {
            normStyle = [char_style];
        } else {
            var filled_index = 0;
            if(char_style != null) {
                if(fill_style != 'open' && fill_style != 'filled') {
                    throw '"' + fill_style + '" is not recognized as text-emphasis-style';
                }
            }
            normStyle = [fill_style, char_style];
        }
        return normStyle;
    }
    bauten._applyElement = function(element, emphasisChar, color,
            position)
    {
        var appliedClassName = 'bauten-text-emphasis-applied';
        if(bauten._hasClass(element, appliedClassName)) {
            return;
        }
        var newChildNodes = [];
        bauten._each(element.childNodes, function(node) {
            if(node.nodeType == 1) {
                bauten._applyElement(node, emphasisChar, color);
            }
        });
        bauten._each(element.childNodes, function(node) {
            switch(node.nodeType) {
                case 1:
                    newChildNodes.push(node);
                    break;
                case 3:
                    var em = bauten._applyText(node, emphasisChar, color,
                            position);
                    em.className = appliedClassName;
                    newChildNodes.push(em);
                    break;
                default:
                    break;
            }
        });
        bauten._each(element.childNodes, function(node) {
            element.removeChild(node);
        });
        newChildNodes.forEach(function(node) {
            element.appendChild(node);
        });
    };
    bauten._applyText = function(textNode, emphasisChar, color,
            position)
    {
        var span = d.createElement('SPAN');
        var text = textNode.nodeValue;
        for(var i = 0; i < text.length; i++) {
            var ruby = d.createElement('RUBY');
            span.appendChild(ruby);

            if(position != null) {
                ruby.setAttribute(
                        'style', 'ruby-position: ' + position + ';');
            }

            var rb = d.createElement('RB');
            ruby.appendChild(rb);

            var pointChar = emphasisChar;
            var c = text.charAt(i);
            if(c.match(bauten._regexIgnoredChars)) {
                pointChar = '';
            }

            var text1 = d.createTextNode(c);
            rb.appendChild(text1);

            var rt = d.createElement('RT');
            ruby.appendChild(rt);
            if(color != null) {
                rt.setAttribute('style', 'color:' + color);
            }
            rt.appendChild(d.createTextNode(pointChar));
        }
        return span;
    };
    bauten._getElementsByStyle = function(style) {
        var elements = [];
        if(style.className != null) {
            bauten._push(elements, d.getElementsByClassName(style.className));
            if(style.tagName != null) {
                elements = elements.filter(function(e) { return e.nodeName == style.tagName; });
            }
        } else if(style.tagName != null) {
            bauten._push(elements, d.getElementsByTagName(style.tagName));
        }
        return elements;
    };
    bauten._isSupportedCss = function() {
        return d.body.style.webkitTextEmphasis != undefined;
    };
    bauten._webkitApplyAll = function(elements, style) {
        elements.forEach(function(element) {
            bauten._webkitApplyElement(element, style);
        });
    };
    bauten._webkitApplyElement = function(element, style) {
        var normStyle = bauten._parseStyle(style);
        if(normStyle.length == 1) {
            if(normStyle[0] != 'none') {
                normStyle = "'" + normStyle[0] + "'";
            } else {
                normStyle = normStyle[0];
            }
        } else if(normStyle.length > 1) {
            var fill_style = normStyle[0];
            var char_style = normStyle[1];
            normStyle = fill_style + ' ' + char_style;
        } else {
            return;
        }
        element.style.webkitTextEmphasisStyle = normStyle;
        if(style.color != null) {
            element.style.webkitTextEmphasisColor = style.color;
        }
        if(style.position != null) {
            element.style.webkitTextEmphasisPosition = style.position;
        }
    }
    d.addEventListener('DOMContentLoaded', function() {
        if(bauten._styles.length == 0) {
            bauten( { 'className': 'bauten-text-emphasis', 'style': 'filled dot',
                'position' : null /* [over|under] && [left|right] */ });
        }
        var applyAll = null;
        if(bauten._isSupportedCss()) {
            applyAll = bauten._webkitApplyAll;
        } else {
            applyAll = bauten._applyAll;
        }
        bauten._styles.forEach(function(style) {
            if(style != null && style.style != null) {
                applyAll(bauten._getElementsByStyle(style), style);
            }
        });
    });
    window['bauten'] = bauten;
})(document);
