/*
    SSChordsLib - A library to enter and format guitar tabs easily and preciously while maintaining the accuracy when zoom in and out.
    Copyright(C) 2021 Susantha Soysa

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/* options = { chordColor: "hex color or known color name"
 *              , notes: [<array of notes>]
 *              , notes_altered: [<array of notes with complex note at first>]
 *              , forms: [<array of all the possible forms of a note>]
 *           }
 */

function SSChordsLib(options) {
    this.settings = {
        femaleColor: "pink",
        chordColor: "orange",
        notes : ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"], // correct order of notes, used for transpose
        notes_altered : ["C#", "C", "D", "Eb", "E", "F#", "F", "G", "Ab", "A", "Bb", "B"], // need complex notes first
        forms : ["maj7", "maj9", "sus7", "dim7", "maj", "sus4", "sus2", "sus", "dim", "aug", "m7", "m9", "m", "7", "9", "\+", ""] // add more complex forms at the beginining
    }
    Object.assign(this.settings, options);
    var sheet = document.createElement('style');
    sheet.innerHTML = "c{position:absolute;margin-top:-1em;color:" + this.settings.chordColor + ";}pre>c{ margin-top:0px;}c::after{content: attr(r); margin-top:-0.2em;position:absolute;}sex[f='1']{color:" + this.settings.femaleColor + ";}";
    document.body.appendChild(sheet);
};

SSChordsLib.prototype.format = function (rowText) {
    var out = this.unformat(rowText);// just make sure, reformatting of formatted text doesn't break anything
    out = this.replaceAll(rowText, "\n", "<br/>"); // line breaks
    var section, original, sIndex, eIndex;
    while (out.indexOf("[[") >= 0) {
        sIndex = out.indexOf("[[");
        eIndex = out.indexOf("]]", sIndex) + 2;
        if (eIndex <= 2) break; // no matching end point, so no formatting

        section = original = out.substring(sIndex, eIndex);
        section = this.replaceAll(section, "/&", "/&nbsp;&nbsp;&");
        section = this.replaceAll(section, "/ &", "/&nbsp;&nbsp;&");
        section = this.replaceAll(section, "/-", "/&nbsp;&nbsp;&nbsp;-");
        section = this.replaceAll(section, "/ -", "/&nbsp;&nbsp;&nbsp;-");
        section = this.replaceAll(section, "-/", "-&nbsp;&nbsp;&nbsp;/");
        section = this.replaceAll(section, "- /", "-&nbsp;&nbsp;&nbsp;/");
        section = this.replaceAll(section, "[[", "<pre>");
        section = this.replaceAll(section, "]]", "</pre>");
        out = this.replaceAll(out, original, section);
    }
    var me = this;
    me.settings.notes_altered.forEach(function (note, c) {
        me.settings.forms.forEach(function (form, f) {
            console.log(note + "," + form);
            out = me.replaceAll(out, "\&" + note + form, "<c chord='" + note + "' r='" + form + "'>" + note + "</c>");
        });
    });
    out = this.replaceAll(out, "  ", "&nbsp;&nbsp;");
    out = this.replaceAll(out, "   ", "&nbsp;&nbsp;&nbsp;");
    out = this.replaceAll(out, "     ", "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    out = this.replaceAll(out, "f{{", "<sex f='1'>");
    out = this.replaceAll(out, "m{{", "<sex f='o'>");
    out = this.replaceAll(out, "}}", "</sex>");
    out = this.replaceAll(out, "</c>/", "</c>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/");
    out = this.replaceAll(out, "</c> /", "</c>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;/");

    return out;
}

SSChordsLib.prototype.unformat = function (formattedHtml) {
    var out = formattedHtml;
    var $div = document.createElement("div");
    $div.innerHTML = formattedHtml;

    $div.querySelectorAll("c").forEach(function (node) {
        node.replaceWith("&" + (node.getAttribute("chord") + node.getAttribute("r")));
    });
    $div.querySelectorAll("br").forEach(function (node) {
        node.replaceWith("\n");
    });
    $div.querySelectorAll("pre").forEach(function (node) {
        node.replaceWith("[[" + node.innerHTML.replaceAll("<br/>", "\n") + "]]");
    });
    $div.querySelectorAll("sex").forEach(function (node) {
        if (node.getAttribute("f") == "1")
            node.replaceWith("f{{" + node.innerHTML + "}}");
        else
            node.replaceWith("m{{" + node.innerHTML + "}}");
    });
    out = this.replaceAll($div.innerText, "&nbsp;", " ");
    out = this.replaceAll(out, "&amp;", "&");
    return out;
}

SSChordsLib.prototype.transpose = function($element, dir) {
    var crd, next;
    var me = this;
    $element.querySelectorAll('c').forEach(function (node) {
        crd = node.getAttribute("chord");
        me.settings.notes.forEach(function (chord, i) {
            if (chord == crd) {
                next = i + dir;
                if (next < 0)
                    next = me.settings.notes.length - 1;
                if (next >= me.settings.notes.length)
                    next = 0;


                node.setAttribute("chord", me.settings.notes[next]);
                //node.setAttribute("r",);
                node.innerHTML = me.settings.notes[next];
            }
        });
    });
}

SSChordsLib.prototype.allChords = function($element) {
    var out = "", chord;
    $element.querySelectorAll('c').forEach(function (node) {
        chord = node.getAttribute("chord") + node.getAttribute("r");
        if (("," + out + ",").indexOf(chord) < 0) {
            if (out != "") out += ",";
            out += chord;
        }
    });
    return out;
}

SSChordsLib.prototype.replaceAll = function(str, find, replaceWith) {
    return str.split(find).join(replaceWith);
}


