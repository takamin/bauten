/*
 * bauten.js - japanese-style text-emphasiser
 *
 * baiten - japanese-style text-emphasiser
 * Copyright (c) 2015 Koji Takami
 * Released under the MIT license
 * https://github.com/takamin/win-c/blob/master/LICENSE
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
        'double-circle':{ 'open': '◎',  'filled': '◉'},
        'triangle':     { 'open': '△',  'filled': '▲'},
        'sesame':       { 'open': '◇',  'filled': '◆'}
    };
    bauten._applyAll = function(elements, style) {
        if(style != null && style.style != null) {
            var emphasisChar = bauten._getEmphasisChar(style);
            if(emphasisChar != null) {
                elements.forEach(function(element) {
                    bauten._applyElement(element, emphasisChar, style.color);
                });
            }
        }
    };
    bauten._getEmphasisChar = function(style) {
        var emphasisChar = null;
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
        if(char_style != 'none') {
            if(bauten._styleIds.indexOf(char_style) < 0) {
                emphasisChar = char_style;
            } else {
                var filled_index = 0;
                if(char_style != null) {
                    if(fill_style != 'open' && fill_style != 'filled') {
                        throw '"' + fill_style + '" is not recognized as text-emphasis-style';
                    }
                }
                emphasisChar = bauten.styleId2Ch[char_style][fill_style];
            }
        }
        return emphasisChar;
    }
    bauten._applyElement = function(element, emphasisChar, color) {
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
                    var em = bauten._applyText(node, emphasisChar, color);
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
    bauten._applyText = function(textNode, emphasisChar, color) {
        var span = d.createElement('SPAN');
        var text = textNode.nodeValue;
        for(var i = 0; i < text.length; i++) {
            var ruby = d.createElement('RUBY');
            span.appendChild(ruby);

            var rb = d.createElement('RB');
            ruby.appendChild(rb);

            var text1 = d.createTextNode(text.charAt(i));
            rb.appendChild(text1);

            var rt = d.createElement('RT');
            ruby.appendChild(rt);
            if(color != null) {
                rt.setAttribute('style', 'color:' + color);
            }
            rt.appendChild(d.createTextNode(emphasisChar));
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
    d.addEventListener('DOMContentLoaded', function() {
        if(bauten._styles.length == 0) {
            bauten( { 'className': 'bauten-text-emphasis', 'style': 'filled dot' });
        }
        bauten._styles.forEach(function(style) {
            bauten._applyAll(bauten._getElementsByStyle(style), style);
        });
    });
    window['bauten'] = bauten;
})(document);
