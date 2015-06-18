(function () {
    var d = window.AmCharts;
    d.AmMap = d.Class({
        inherits: d.AmChart, construct: function (a) {
            this.cname = "AmMap";
            this.type = "map";
            this.theme = a;
            this.version = "3.14.2";
            this.svgNotSupported = "This browser doesn't support SVG. Use Chrome, Firefox, Internet Explorer 9 or later.";
            this.createEvents("rollOverMapObject", "rollOutMapObject", "clickMapObject", "selectedObjectChanged", "homeButtonClicked", "zoomCompleted", "dragCompleted", "positionChanged", "writeDevInfo", "click");
            this.zoomDuration = 1;
            this.zoomControl = new d.ZoomControl(a);
            this.fitMapToContainer = !0;
            this.mouseWheelZoomEnabled = this.backgroundZoomsToTop = !1;
            this.allowClickOnSelectedObject = this.useHandCursorOnClickableOjects = this.showBalloonOnSelectedObject = !0;
            this.showObjectsAfterZoom = this.wheelBusy = !1;
            this.zoomOnDoubleClick = this.useObjectColorForBalloon = !0;
            this.allowMultipleDescriptionWindows = !1;
            this.dragMap = this.centerMap = this.linesAboveImages = !0;
            this.colorSteps = 5;
            this.showAreasInList = !0;
            this.showLinesInList = this.showImagesInList = !1;
            this.areasProcessor = new d.AreasProcessor(this);
            this.areasSettings = new d.AreasSettings(a);
            this.imagesProcessor = new d.ImagesProcessor(this);
            this.imagesSettings = new d.ImagesSettings(a);
            this.linesProcessor = new d.LinesProcessor(this);
            this.linesSettings = new d.LinesSettings(a);
            this.showDescriptionOnHover = !1;
            d.AmMap.base.construct.call(this, a);
            this.creditsPosition = "bottom-left";
            this.product = "ammap";
            this.path = "ammap/";
            this.areasClasses = {};
            d.applyTheme(this, a, this.cname)
        }, initChart: function () {
            this.zoomInstantly = !0;
            var a = this.container;
            if (this.sizeChanged &&
                d.hasSVG && this.chartCreated) {
                this.freeLabelsSet && this.freeLabelsSet.remove();
                this.freeLabelsSet = a.set();
                this.container.setSize(this.realWidth, this.realHeight);
                this.resizeMap();
                this.drawBackground();
                this.redrawLabels();
                this.drawTitles();
                this.processObjects();
                this.rescaleObjects();
                this.zoomControl.init(this, a);
                this.drawBg();
                var b = this.smallMap;
                b && b.init(this, a);
                (b = this.valueLegend) && b.init(this, a);
                this.sizeChanged = !1;
                this.zoomToLongLat(this.zLevelTemp, this.zLongTemp, this.zLatTemp, !0);
                this.previousWidth =
                    this.realWidth;
                this.previousHeight = this.realHeight;
                this.updateSmallMap();
                this.linkSet.toFront()
            } else(d.AmMap.base.initChart.call(this), d.hasSVG) ? (this.dataChanged && (this.parseData(), this.dispatchDataUpdated = !0, this.dataChanged = !1, a = this.legend) && (a.position = "absolute", a.invalidateSize()), this.createDescriptionsDiv(), this.svgAreas = [], this.svgAreasById = {}, this.drawChart()) : (this.chartDiv.style.textAlign = "", this.chartDiv.setAttribute("class", "ammapAlert"), this.chartDiv.innerHTML = this.svgNotSupported,
                this.fire("failed", {type: "failed", chart: this}))
        }, storeTemp: function () {
            var a = this.zoomLongitude();
            isNaN(a) || (this.zLongTemp = a);
            a = this.zoomLatitude();
            isNaN(a) || (this.zLatTemp = a);
            a = this.zoomLevel();
            isNaN(a) || (this.zLevelTemp = a)
        }, invalidateSize: function () {
            this.storeTemp();
            d.AmMap.base.invalidateSize.call(this)
        }, validateSize: function () {
            d.hasSVG && this.storeTemp();
            d.AmMap.base.validateSize.call(this)
        }, handleWheelReal: function (a) {
            if (!this.wheelBusy) {
                this.stopAnimation();
                var b = this.zoomLevel(), c = this.zoomControl,
                    e = c.zoomFactor;
                this.wheelBusy = !0;
                a = d.fitToBounds(0 < a ? b * e : b / e, c.minZoomLevel, c.maxZoomLevel);
                e = this.mouseX / this.mapWidth;
                c = this.mouseY / this.mapHeight;
                e = (this.zoomX() - e) * (a / b) + e;
                b = (this.zoomY() - c) * (a / b) + c;
                this.zoomTo(a, e, b)
            }
        }, addLegend: function (a, b) {
            a.position = "absolute";
            a.autoMargins = !1;
            a.valueWidth = 0;
            a.switchable = !1;
            d.AmMap.base.addLegend.call(this, a, b);
            void 0 === a.enabled && (a.enabled = !0);
            return a
        }, handleLegendEvent: function () {
        }, createDescriptionsDiv: function () {
            if (!this.descriptionsDiv) {
                var a = document.createElement("div"),
                    b = a.style;
                b.position = "absolute";
                b.left = "0px";
                b.top = "0px";
                this.descriptionsDiv = a
            }
            this.containerDiv.appendChild(this.descriptionsDiv)
        }, drawChart: function () {
            d.AmMap.base.drawChart.call(this);
            var a = this.dataProvider;
            this.dataProvider = a = d.extend(a, new d.MapData, !0);
            this.areasSettings = d.processObject(this.areasSettings, d.AreasSettings, this.theme);
            this.imagesSettings = d.processObject(this.imagesSettings, d.ImagesSettings, this.theme);
            this.linesSettings = d.processObject(this.linesSettings, d.LinesSettings, this.theme);
            var b = this.container;
            this.mapContainer && this.mapContainer.remove();
            this.mapContainer = b.set();
            this.graphsSet.push(this.mapContainer);
            var c;
            a.map && (c = d.maps[a.map]);
            a.mapVar && (c = a.mapVar);
            c ? (this.svgData = c.svg, this.getBounds(), this.buildEverything()) : (a = a.mapURL) && this.loadXml(a);
            this.balloonsSet.toFront()
        }, drawBg: function () {
            var a = this;
            a.background.click(function () {
                a.handleBackgroundClick()
            })
        }, buildEverything: function () {
            if (0 < this.realWidth && 0 < this.realHeight) {
                var a = this.container;
                this.zoomControl = d.processObject(this.zoomControl,
                    d.ZoomControl, this.theme);
                this.zoomControl.init(this, a);
                this.drawBg();
                this.buildSVGMap();
                var b = this.smallMap;
                b && (b = this.smallMap = d.processObject(this.smallMap, d.SmallMap, this.theme), b.init(this, a));
                b = this.dataProvider;
                isNaN(b.zoomX) && isNaN(b.zoomY) && isNaN(b.zoomLatitude) && isNaN(b.zoomLongitude) && (this.centerMap ? (b.zoomLatitude = this.coordinateToLatitude(this.mapHeight / 2), b.zoomLongitude = this.coordinateToLongitude(this.mapWidth / 2)) : (b.zoomX = 0, b.zoomY = 0), this.zoomInstantly = !0);
                this.selectObject(this.dataProvider);
                this.processAreas();
                if (b = this.valueLegend)this.valueLegend = b = d.processObject(b, d.ValueLegend, this.theme), b.init(this, a);
                this.objectList && (a = this.objectList = d.processObject(this.objectList, d.ObjectList)) && (this.clearObjectList(), a.init(this));
                this.dispDUpd();
                this.linkSet.toFront();
                this.chartCreated = !0
            } else this.cleanChart()
        }, hideGroup: function (a) {
            this.showHideGroup(a, !1)
        }, showGroup: function (a) {
            this.showHideGroup(a, !0)
        }, showHideGroup: function (a, b) {
            this.showHideReal(this.imagesProcessor.allObjects, a,
                b);
            this.showHideReal(this.areasProcessor.allObjects, a, b);
            this.showHideReal(this.linesProcessor.allObjects, a, b)
        }, showHideReal: function (a, b, c) {
            var e;
            for (e = 0; e < a.length; e++) {
                var f = a[e];
                if (f.groupId == b) {
                    var g = f.displayObject;
                    g && (c ? (f.hidden = !1, g.show()) : (f.hidden = !0, g.hide()))
                }
            }
        }, update: function () {
            d.hasSVG && (d.AmMap.base.update.call(this), this.zoomControl && this.zoomControl.update())
        }, animateMap: function () {
            var a = this;
            a.totalFrames = 1E3 * a.zoomDuration / d.updateRate;
            a.totalFrames += 1;
            a.frame = 0;
            a.tweenPercent =
                0;
            setTimeout(function () {
                a.updateSize.call(a)
            }, d.updateRate)
        }, updateSize: function () {
            var a = this, b = a.totalFrames;
            a.preventHover = !0;
            a.frame <= b ? (a.frame++, b = d.easeOutSine(0, a.frame, 0, 1, b), 1 <= b ? (b = 1, a.preventHover = !1, a.wheelBusy = !1) : setTimeout(function () {
                a.updateSize.call(a)
            }, d.updateRate), .8 < b && (a.preventHover = !1)) : (b = 1, a.preventHover = !1, a.wheelBusy = !1);
            a.tweenPercent = b;
            a.rescaleMapAndObjects()
        }, rescaleMapAndObjects: function () {
            var a = this.initialScale, b = this.initialX, c = this.initialY, e = this.tweenPercent,
                a = a + (this.finalScale - a) * e;
            this.mapContainer.translate(b + (this.finalX - b) * e, c + (this.finalY - c) * e, a);
            if (this.areasSettings.adjustOutlineThickness)for (b = this.dataProvider.areas, c = 0; c < b.length; c++) {
                var f = b[c], g = f.displayObject;
                g && g.setAttr("stroke-width", f.outlineThicknessReal / a)
            }
            this.rescaleObjects();
            this.positionChanged();
            this.updateSmallMap();
            1 == e && (e = {type: "zoomCompleted", chart: this}, this.fire(e.type, e))
        }, updateSmallMap: function () {
            this.smallMap && this.smallMap.update()
        }, rescaleObjects: function () {
            var a =
                this.mapContainer.scale, b = this.imagesProcessor.objectsToResize, c;
            for (c = 0; c < b.length; c++) {
                var e = b[c].image;
                e.translate(e.x, e.y, b[c].scale / a, !0)
            }
            b = this.linesProcessor;
            if (e = b.linesToResize)for (c = 0; c < e.length; c++) {
                var f = e[c];
                f.line.setAttr("stroke-width", f.thickness / a)
            }
            b = b.objectsToResize;
            for (c = 0; c < b.length; c++)e = b[c], e.translate(e.x, e.y, 1 / a)
        }, handleTouchStart: function (a) {
            this.handleMouseMove(a);
            this.handleMouseDown(a)
        }, handleTouchEnd: function (a) {
            this.previousDistance = NaN;
            this.handleReleaseOutside(a)
        },
        handleMouseDown: function (a) {
            d.resetMouseOver();
            this.mouseIsOver = !0;
            a && this.mouseIsOver && a.preventDefault && this.panEventsEnabled && a.preventDefault();
            if (this.chartCreated && !this.preventHover && (this.dragMap && (this.stopAnimation(), this.isDragging = !0, this.mapContainerClickX = this.mapContainer.x, this.mapContainerClickY = this.mapContainer.y), a || (a = window.event), a.shiftKey && !0 === this.developerMode && this.getDevInfo(), a && a.touches)) {
                var b = this.mouseX, c = this.mouseY, e = a.touches.item(1);
                e && (a = e.pageX - d.findPosX(this.div),
                    e = e.pageY - d.findPosY(this.div), this.middleXP = (b + (a - b) / 2) / this.realWidth, this.middleYP = (c + (e - c) / 2) / this.realHeight)
            }
        }, stopDrag: function () {
            this.isDragging = !1
        }, handleReleaseOutside: function () {
            if (d.isModern && !this.preventHover) {
                this.stopDrag();
                var a = this.zoomControl;
                a && a.draggerUp && a.draggerUp();
                this.mapWasDragged = !1;
                var a = this.mapContainer, b = this.mapContainerClickX, c = this.mapContainerClickY;
                isNaN(b) || isNaN(c) || !(2 < Math.abs(a.x - b) || Math.abs(a.y - c)) || (this.mapWasDragged = !0, a = {
                    type: "dragCompleted", zoomX: this.zoomX(),
                    zoomY: this.zoomY(), zoomLevel: this.zoomLevel(), chart: this
                }, this.fire(a.type, a));
                !this.mouseIsOver || this.mapWasDragged || this.skipClick || (a = {
                    type: "click",
                    x: this.mouseX,
                    y: this.mouseY,
                    chart: this
                }, this.fire(a.type, a), this.skipClick = !1);
                this.mapContainerClickY = this.mapContainerClickX = NaN;
                this.objectWasClicked = !1;
                this.zoomOnDoubleClick && this.mouseIsOver && (a = (new Date).getTime(), 200 > a - this.previousClickTime && 20 < a - this.previousClickTime && this.doDoubleClickZoom(), this.previousClickTime = a)
            }
        }, handleTouchMove: function (a) {
            this.handleMouseMove(a)
        },
        resetPinch: function () {
            this.mapWasPinched = !1
        }, handleMouseMove: function (a) {
            var b = this;
            d.AmMap.base.handleMouseMove.call(b, a);
            b.panEventsEnabled && b.mouseIsOver && a && a.preventDefault && a.preventDefault();
            var c = b.previuosMouseX, e = b.previuosMouseY, f = b.mouseX, g = b.mouseY, l = b.zoomControl;
            isNaN(c) && (c = f);
            isNaN(e) && (e = g);
            b.mouse2X = NaN;
            b.mouse2Y = NaN;
            a && a.touches && (a = a.touches.item(1)) && (b.mouse2X = a.pageX - d.findPosX(b.div), b.mouse2Y = a.pageY - d.findPosY(b.div));
            if (a = b.mapContainer) {
                var h = b.mouse2X, k = b.mouse2Y;
                b.pinchTO &&
                clearTimeout(b.pinchTO);
                b.pinchTO = setTimeout(function () {
                    b.resetPinch.call(b)
                }, 1E3);
                var m = b.realHeight, q = b.realWidth, n = b.mapWidth, v = b.mapHeight;
                if (!isNaN(h)) {
                    b.stopDrag();
                    var h = Math.sqrt(Math.pow(h - f, 2) + Math.pow(k - g, 2)), u = b.previousDistance, k = Math.max(b.realWidth, b.realHeight);
                    5 > Math.abs(u - h) && (b.isDragging = !0);
                    if (!isNaN(u)) {
                        var C = 5 * Math.abs(u - h) / k, k = a.scale, k = d.fitToBounds(u < h ? k + k * C : k - k * C, l.minZoomLevel, l.maxZoomLevel), l = b.zoomLevel(), z = b.middleXP, u = b.middleYP, C = m / v, x = q / n, z = (b.zoomX() - z * x) * (k / l) +
                            z * x, u = (b.zoomY() - u * C) * (k / l) + u * C;
                        .1 < Math.abs(k - l) && (b.zoomTo(k, z, u, !0), b.mapWasPinched = !0, clearTimeout(b.pinchTO))
                    }
                    b.previousDistance = h
                }
                h = a.scale;
                b.isDragging && (b.hideBalloon(), b.positionChanged(), c = a.x + (f - c), e = a.y + (g - e), b.preventDragOut && (v = -v * h + m / 2, m /= 2, c = d.fitToBounds(c, -n * h + q / 2, q / 2), e = d.fitToBounds(e, v, m)), a.translate(c, e, h), b.updateSmallMap());
                b.previuosMouseX = f;
                b.previuosMouseY = g
            }
        }, selectObject: function (a) {
            var b = this;
            a || (a = b.dataProvider);
            a.isOver = !1;
            var c = a.linkToObject;
            "string" == typeof c &&
            (c = b.getObjectById(c));
            a.useTargetsZoomValues && c && (a.zoomX = c.zoomX, a.zoomY = c.zoomY, a.zoomLatitude = c.zoomLatitude, a.zoomLongitude = c.zoomLongitude, a.zoomLevel = c.zoomLevel);
            var e = b.selectedObject;
            e && b.returnInitialColor(e);
            b.selectedObject = a;
            var f = !1, g;
            "MapArea" == a.objectType && (a.autoZoomReal && (f = !0), g = b.areasSettings.selectedOutlineColor);
            if (c && !f && ("string" == typeof c && (c = b.getObjectById(c)), isNaN(a.zoomLevel) && isNaN(a.zoomX) && isNaN(a.zoomY))) {
                if (b.extendMapData(c))return;
                b.selectObject(c);
                return
            }
            b.allowMultipleDescriptionWindows ||
            b.closeAllDescriptions();
            clearTimeout(b.selectedObjectTimeOut);
            clearTimeout(b.processObjectsTimeOut);
            c = b.zoomDuration;
            !f && isNaN(a.zoomLevel) && isNaN(a.zoomX) && isNaN(a.zoomY) ? (b.showDescriptionAndGetUrl(), b.processObjects()) : (b.selectedObjectTimeOut = setTimeout(function () {
                b.showDescriptionAndGetUrl.call(b)
            }, 1E3 * c + 200), b.showObjectsAfterZoom ? b.processObjectsTimeOut = setTimeout(function () {
                b.processObjects.call(b)
            }, 1E3 * c + 200) : b.processObjects());
            c = a.displayObject;
            f = a.selectedColorReal;
            if (c) {
                if (a.bringForwardOnHover &&
                    c.toFront(), !a.preserveOriginalAttributes) {
                    c.setAttr("stroke", a.outlineColorReal);
                    void 0 !== f && c.setAttr("fill", f);
                    void 0 !== g && c.setAttr("stroke", g);
                    if ("MapLine" == a.objectType) {
                        var d = a.lineSvg;
                        d && d.setAttr("stroke", f);
                        if (d = a.arrowSvg)d.setAttr("fill", f), d.setAttr("stroke", f)
                    }
                    if (d = a.imageLabel) {
                        var h = a.selectedLabelColorReal;
                        void 0 !== h && d.setAttr("fill", h)
                    }
                    a.selectable || (c.setAttr("cursor", "default"), d && d.setAttr("cursor", "default"))
                }
            } else b.returnInitialColorReal(a);
            if (c = a.groupId)for (d = b.getGroupById(c),
                                       h = 0; h < d.length; h++) {
                var k = d[h];
                k.isOver = !1;
                if (c = k.displayObject) {
                    var m = k.selectedColorReal;
                    void 0 !== g && c.setAttr("stroke", g);
                    void 0 !== m ? c.setAttr("fill", m) : b.returnInitialColor(k);
                    "MapLine" == k.objectType && ((c = k.lineSvg) && c.setAttr("stroke", f), c = k.arrowSvg) && (c.setAttr("fill", f), c.setAttr("stroke", f))
                }
            }
            b.zoomToSelectedObject();
            e != a && (a = {type: "selectedObjectChanged", chart: b}, b.fire(a.type, a))
        }, returnInitialColor: function (a, b) {
            this.returnInitialColorReal(a);
            b && (a.isFirst = !1);
            if (this.selectedObject.bringForwardOnHover) {
                var c =
                    this.selectedObject.displayObject;
                c && c.toFront()
            }
            if (c = a.groupId) {
                var c = this.getGroupById(c), e;
                for (e = 0; e < c.length; e++)this.returnInitialColorReal(c[e]), b && (c[e].isFirst = !1)
            }
        }, closeAllDescriptions: function () {
            this.descriptionsDiv.innerHTML = ""
        }, returnInitialColorReal: function (a) {
            a.isOver = !1;
            var b = a.displayObject;
            if (b) {
                b.toPrevious();
                if ("MapImage" == a.objectType) {
                    var c = a.tempScale;
                    isNaN(c) || b.translate(b.x, b.y, c, !0);
                    a.tempScale = NaN
                }
                c = a.colorReal;
                if ("MapLine" == a.objectType) {
                    var e = a.lineSvg;
                    e && e.setAttr("stroke",
                        c);
                    if (e = a.arrowSvg)e.setAttr("fill", c), e.setAttr("stroke", c)
                }
                a.showAsSelected && (c = a.selectedColorReal);
                "bubble" == a.type && (c = void 0);
                void 0 !== c && b.setAttr("fill", c);
                (e = a.image) && e.setAttr("fill", c);
                b.setAttr("stroke", a.outlineColorReal);
                "MapArea" == a.objectType && (c = 1, this.areasSettings.adjustOutlineThickness && (c = this.zoomLevel()), b.setAttr("fill-opacity", a.alphaReal), b.setAttr("stroke-opacity", a.outlineAlphaReal), b.setAttr("stroke-width", a.outlineThicknessReal / c));
                (c = a.pattern) && b.pattern(c, this.mapScale,
                    this.path);
                (b = a.imageLabel) && !a.labelInactive && b.setAttr("fill", a.labelColorReal)
            }
        }, zoomToRectangle: function (a, b, c, e) {
            var f = this.realWidth, g = this.realHeight, l = this.mapSet.scale, h = this.zoomControl, f = d.fitToBounds(c / f > e / g ? .8 * f / (c * l) : .8 * g / (e * l), h.minZoomLevel, h.maxZoomLevel);
            this.zoomToMapXY(f, (a + c / 2) * l, (b + e / 2) * l)
        }, zoomToLatLongRectangle: function (a, b, c, e) {
            var f = this.dataProvider, g = this.zoomControl, l = Math.abs(c - a), h = Math.abs(b - e), k = Math.abs(f.rightLongitude - f.leftLongitude), f = Math.abs(f.topLatitude - f.bottomLatitude),
                g = d.fitToBounds(l / k > h / f ? .8 * k / l : .8 * f / h, g.minZoomLevel, g.maxZoomLevel);
            this.zoomToLongLat(g, a + (c - a) / 2, e + (b - e) / 2)
        }, getGroupById: function (a) {
            var b = [];
            this.getGroup(this.imagesProcessor.allObjects, a, b);
            this.getGroup(this.linesProcessor.allObjects, a, b);
            this.getGroup(this.areasProcessor.allObjects, a, b);
            return b
        }, zoomToGroup: function (a) {
            a = "object" == typeof a ? a : this.getGroupById(a);
            var b, c, e, f, g;
            for (g = 0; g < a.length; g++) {
                var d = a[g].displayObject;
                if (d) {
                    var h = d.getBBox(), d = h.y, k = h.y + h.height, m = h.x, h = h.x + h.width;
                    if (d < b || isNaN(b))b = d;
                    if (k > f || isNaN(f))f = k;
                    if (m < c || isNaN(c))c = m;
                    if (h > e || isNaN(e))e = h
                }
            }
            a = this.mapSet.getBBox();
            c -= a.x;
            e -= a.x;
            f -= a.y;
            b -= a.y;
            this.zoomToRectangle(c, b, e - c, f - b)
        }, getGroup: function (a, b, c) {
            if (a) {
                var e;
                for (e = 0; e < a.length; e++) {
                    var f = a[e];
                    f.groupId == b && c.push(f)
                }
            }
        }, zoomToStageXY: function (a, b, c, e) {
            if (!this.objectWasClicked) {
                var f = this.zoomControl;
                a = d.fitToBounds(a, f.minZoomLevel, f.maxZoomLevel);
                f = this.zoomLevel();
                c = this.coordinateToLatitude((c - this.mapContainer.y) / f);
                b = this.coordinateToLongitude((b -
                this.mapContainer.x) / f);
                this.zoomToLongLat(a, b, c, e)
            }
        }, zoomToLongLat: function (a, b, c, e) {
            b = this.longitudeToCoordinate(b);
            c = this.latitudeToCoordinate(c);
            this.zoomToMapXY(a, b, c, e)
        }, zoomToMapXY: function (a, b, c, e) {
            var f = this.mapWidth, g = this.mapHeight;
            this.zoomTo(a, -(b / f) * a + this.realWidth / f / 2, -(c / g) * a + this.realHeight / g / 2, e)
        }, zoomToObject: function (a) {
            if (a) {
                var b = a.zoomLatitude, c = a.zoomLongitude, e = a.zoomLevel, f = this.zoomInstantly, g = a.zoomX, l = a.zoomY, h = this.realWidth, k = this.realHeight;
                isNaN(e) || (isNaN(b) || isNaN(c) ?
                    this.zoomTo(e, g, l, f) : this.zoomToLongLat(e, c, b, f));
                this.zoomInstantly = !1;
                "MapImage" == a.objectType && isNaN(a.zoomX) && isNaN(a.zoomY) && isNaN(a.zoomLatitude) && isNaN(a.zoomLongitude) && !isNaN(a.latitude) && !isNaN(a.longitude) && this.zoomToLongLat(a.zoomLevel, a.longitude, a.latitude);
                "MapArea" == a.objectType && (g = a.displayObject.getBBox(), b = this.mapScale, c = g.x * b, e = g.y * b, f = g.width * b, g = g.height * b, h = a.autoZoomReal && isNaN(a.zoomLevel) ? f / h > g / k ? .8 * h / f : .8 * k / g : a.zoomLevel, k = this.zoomControl, h = d.fitToBounds(h, k.minZoomLevel,
                    k.maxZoomLevel), isNaN(a.zoomX) && isNaN(a.zoomY) && isNaN(a.zoomLatitude) && isNaN(a.zoomLongitude) && (a = this.mapSet.getBBox(), this.zoomToMapXY(h, -a.x * b + c + f / 2, -a.y * b + e + g / 2)))
            }
        }, zoomToSelectedObject: function () {
            this.zoomToObject(this.selectedObject)
        }, zoomTo: function (a, b, c, e) {
            var f = this.zoomControl;
            a = d.fitToBounds(a, f.minZoomLevel, f.maxZoomLevel);
            f = this.zoomLevel();
            isNaN(b) && (b = this.realWidth / this.mapWidth, b = (this.zoomX() - .5 * b) * (a / f) + .5 * b);
            isNaN(c) && (c = this.realHeight / this.mapHeight, c = (this.zoomY() - .5 * c) * (a /
            f) + .5 * c);
            this.stopAnimation();
            isNaN(a) || (f = this.mapContainer, this.initialX = f.x, this.initialY = f.y, this.initialScale = f.scale, this.finalX = this.mapWidth * b, this.finalY = this.mapHeight * c, this.finalScale = a, this.finalX != this.initialX || this.finalY != this.initialY || this.finalScale != this.initialScale ? e ? (this.tweenPercent = 1, this.rescaleMapAndObjects(), this.wheelBusy = !1) : this.animateMap() : this.wheelBusy = !1)
        }, loadXml: function (a) {
            var b;
            window.XMLHttpRequest && (b = new XMLHttpRequest);
            b.overrideMimeType && b.overrideMimeType("text/xml");
            b.open("GET", a, !1);
            b.send();
            this.parseXMLObject(b.responseXML);
            this.svgData && this.buildEverything()
        }, stopAnimation: function () {
            this.frame = this.totalFrames
        }, processObjects: function () {
            var a = this.container, b = this.stageImagesContainer;
            b && b.remove();
            this.stageImagesContainer = b = a.set();
            this.trendLinesSet.push(b);
            var c = this.stageLinesContainer;
            c && c.remove();
            this.stageLinesContainer = c = a.set();
            this.trendLinesSet.push(c);
            var e = this.mapImagesContainer;
            e && e.remove();
            this.mapImagesContainer = e = a.set();
            this.mapContainer.push(e);
            var f = this.mapLinesContainer;
            f && f.remove();
            this.mapLinesContainer = f = a.set();
            this.mapContainer.push(f);
            this.linesAboveImages ? (e.toFront(), b.toFront(), f.toFront(), c.toFront()) : (f.toFront(), c.toFront(), e.toFront(), b.toFront());
            if (a = this.selectedObject)this.imagesProcessor.reset(), this.linesProcessor.reset(), this.linesAboveImages ? (this.imagesProcessor.process(a), this.linesProcessor.process(a)) : (this.linesProcessor.process(a), this.imagesProcessor.process(a));
            this.rescaleObjects()
        }, processAreas: function () {
            this.areasProcessor.process(this.dataProvider)
        },
        buildSVGMap: function () {
            var a = this.svgData.g.path, b = this.container, c = b.set();
            void 0 === a.length && (a = [a]);
            var e;
            for (e = 0; e < a.length; e++) {
                var f = a[e], g = f.d, d = f.title;
                f.titleTr && (d = f.titleTr);
                g = b.path(g);
                g.id = f.id;
                if (this.areasSettings.preserveOriginalAttributes) {
                    g.customAttr = {};
                    for (var h in f)"d" != h && "id" != h && "title" != h && (g.customAttr[h] = f[h])
                }
                this.svgAreasById[f.id] = {area: g, title: d, className: f["class"]};
                this.svgAreas.push(g);
                c.push(g)
            }
            this.mapSet = c;
            this.mapContainer.push(c);
            this.resizeMap()
        }, addObjectEventListeners: function (a,
                                              b) {
            var c = this;
            a.mouseup(function (a) {
                c.clickMapObject(b, a)
            }).mouseover(function (a) {
                c.rollOverMapObject(b, !0, a)
            }).mouseout(function (a) {
                c.rollOutMapObject(b, a)
            }).touchend(function (a) {
                c.clickMapObject(b, a)
            }).touchstart(function (a) {
                c.rollOverMapObject(b, !0, a)
            })
        }, checkIfSelected: function (a) {
            var b = this.selectedObject;
            if (b == a)return !0;
            if (b = b.groupId) {
                var b = this.getGroupById(b), c;
                for (c = 0; c < b.length; c++)if (b[c] == a)return !0
            }
            return !1
        }, clearMap: function () {
            this.chartDiv.innerHTML = "";
            this.clearObjectList()
        }, clearObjectList: function () {
            var a =
                this.objectList;
            a && a.div && (a.div.innerHTML = "")
        }, checkIfLast: function (a) {
            if (a) {
                var b = a.parentNode;
                if (b && b.lastChild == a)return !0
            }
            return !1
        }, showAsRolledOver: function (a) {
            var b = a.displayObject;
            if (!a.showAsSelected && b && !a.isOver) {
                b.node.onmouseout = function () {
                };
                b.node.onmouseover = function () {
                };
                b.node.onclick = function () {
                };
                !a.isFirst && a.bringForwardOnHover && (b.toFront(), a.isFirst = !0);
                var c = a.rollOverColorReal, e;
                a.preserveOriginalAttributes && (c = void 0);
                if (void 0 != c)if ("MapImage" == a.objectType)(e = a.image) && e.setAttr("fill",
                    c); else if ("MapLine" == a.objectType) {
                    if ((e = a.lineSvg) && e.setAttr("stroke", c), e = a.arrowSvg)e.setAttr("fill", c), e.setAttr("stroke", c)
                } else b.setAttr("fill", c);
                (c = a.imageLabel) && !a.labelInactive && (e = a.labelRollOverColorReal, void 0 != e && c.setAttr("fill", e));
                c = a.rollOverOutlineColorReal;
                void 0 != c && ("MapImage" == a.objectType ? (e = a.image) && e.setAttr("stroke", c) : b.setAttr("stroke", c));
                if ("MapArea" == a.objectType) {
                    c = this.areasSettings;
                    e = a.rollOverAlphaReal;
                    isNaN(e) || b.setAttr("fill-opacity", e);
                    e = c.rollOverOutlineAlpha;
                    isNaN(e) || b.setAttr("stroke-opacity", e);
                    e = 1;
                    this.areasSettings.adjustOutlineThickness && (e = this.zoomLevel());
                    var f = c.rollOverOutlineThickness;
                    isNaN(f) || b.setAttr("stroke-width", f / e);
                    (c = c.rollOverPattern) && b.pattern(c, this.mapScale, chart.path)
                }
                "MapImage" == a.objectType && (c = a.rollOverScaleReal, isNaN(c) || 1 == c || (a.tempScale = b.scale, b.translate(b.x, b.y, b.scale * c, !0)));
                this.useHandCursorOnClickableOjects && this.checkIfClickable(a) && b.setAttr("cursor", "pointer");
                this.addObjectEventListeners(b, a);
                a.isOver = !0
            }
        },
        rollOverMapObject: function (a, b, c) {
            if (this.chartCreated) {
                this.handleMouseMove();
                var e = this.previouslyHovered;
                e && e != a ? (!1 === this.checkIfSelected(e) && (this.returnInitialColor(e, !0), this.previouslyHovered = null), this.hideBalloon()) : clearTimeout(this.hoverInt);
                if (!this.preventHover) {
                    if (!1 === this.checkIfSelected(a)) {
                        if (e = a.groupId) {
                            var e = this.getGroupById(e), f;
                            for (f = 0; f < e.length; f++)e[f] != a && this.showAsRolledOver(e[f])
                        }
                        this.showAsRolledOver(a)
                    } else(e = a.displayObject) && (this.allowClickOnSelectedObject ? e.setAttr("cursor",
                        "pointer") : e.setAttr("cursor", "default"));
                    if (this.showDescriptionOnHover)this.showDescription(a); else if ((this.showBalloonOnSelectedObject || !this.checkIfSelected(a)) && !1 !== b && (f = this.balloon, b = a.colorReal, e = "", void 0 !== b && this.useObjectColorForBalloon || (b = f.fillColor), (f = a.balloonTextReal) && (e = this.formatString(f, a)), this.balloonLabelFunction && (e = this.balloonLabelFunction(a, this)), e && "" !== e)) {
                        var g, d;
                        "MapArea" == a.objectType && (d = this.getAreaCenterLatitude(a), g = this.getAreaCenterLongitude(a), d = this.latitudeToY(d),
                            g = this.longitudeToX(g));
                        "MapImage" == a.objectType && (g = a.displayObject.x * this.zoomLevel() + this.mapContainer.x, d = a.displayObject.y * this.zoomLevel() + this.mapContainer.y);
                        this.showBalloon(e, b, this.mouseIsOver, g, d)
                    }
                    c = {type: "rollOverMapObject", mapObject: a, chart: this, event: c};
                    this.fire(c.type, c);
                    this.previouslyHovered = a
                }
            }
        }, longitudeToX: function (a) {
            return this.longitudeToCoordinate(a) * this.zoomLevel() + this.mapContainer.x
        }, latitudeToY: function (a) {
            return this.latitudeToCoordinate(a) * this.zoomLevel() + this.mapContainer.y
        },
        rollOutMapObject: function (a, b) {
            this.hideBalloon();
            if (this.chartCreated && a.isOver) {
                this.checkIfSelected(a) || this.returnInitialColor(a);
                var c = {type: "rollOutMapObject", mapObject: a, chart: this, event: b};
                this.fire(c.type, c)
            }
        }, formatString: function (a, b) {
            var c = this.nf, e = this.pf, f = b.title;
            b.titleTr && (f = b.titleTr);
            void 0 == f && (f = "");
            var g = b.value, g = isNaN(g) ? "" : d.formatNumber(g, c), c = b.percents, c = isNaN(c) ? "" : d.formatNumber(c, e), e = b.description;
            void 0 == e && (e = "");
            var l = b.customData;
            void 0 == l && (l = "");
            return a = d.massReplace(a,
                {"[[title]]": f, "[[value]]": g, "[[percent]]": c, "[[description]]": e, "[[customData]]": l})
        }, clickMapObject: function (a, b) {
            this.hideBalloon();
            if (this.chartCreated && !this.preventHover && !this.mapWasDragged && this.checkIfClickable(a) && !this.mapWasPinched) {
                this.selectObject(a);
                var c = {type: "clickMapObject", mapObject: a, chart: this, event: b};
                this.fire(c.type, c);
                this.objectWasClicked = !0
            }
        }, checkIfClickable: function (a) {
            var b = this.allowClickOnSelectedObject;
            return this.selectedObject == a && b ? !0 : this.selectedObject != a ||
            b ? !0 === a.selectable || "MapArea" == a.objectType && a.autoZoomReal || a.url || a.linkToObject || 0 < a.images.length || 0 < a.lines.length || !isNaN(a.zoomLevel) || !isNaN(a.zoomX) || !isNaN(a.zoomY) || a.description ? !0 : !1 : !1
        }, resizeMap: function () {
            var a = this.mapSet;
            if (a) {
                var b = 1, c = a.getBBox(), e = this.realWidth, f = this.realHeight, g = c.width, d = c.height;
                this.fitMapToContainer && (b = g / e > d / f ? e / g : f / d);
                a.translate(-c.x * b, -c.y * b, b);
                this.mapScale = b;
                this.mapHeight = d * b;
                this.mapWidth = g * b
            }
        }, zoomIn: function () {
            this.skipClick = !0;
            var a = this.zoomLevel() *
                this.zoomControl.zoomFactor;
            this.zoomTo(a)
        }, zoomOut: function () {
            this.skipClick = !0;
            var a = this.zoomLevel() / this.zoomControl.zoomFactor;
            this.zoomTo(a)
        }, moveLeft: function () {
            this.skipClick = !0;
            var a = this.zoomX() + this.zoomControl.panStepSize;
            this.zoomTo(this.zoomLevel(), a, this.zoomY())
        }, moveRight: function () {
            this.skipClick = !0;
            var a = this.zoomX() - this.zoomControl.panStepSize;
            this.zoomTo(this.zoomLevel(), a, this.zoomY())
        }, moveUp: function () {
            this.skipClick = !0;
            var a = this.zoomY() + this.zoomControl.panStepSize;
            this.zoomTo(this.zoomLevel(),
                this.zoomX(), a)
        }, moveDown: function () {
            this.skipClick = !0;
            var a = this.zoomY() - this.zoomControl.panStepSize;
            this.zoomTo(this.zoomLevel(), this.zoomX(), a)
        }, zoomX: function () {
            return this.mapSet ? Math.round(1E4 * this.mapContainer.x / this.mapWidth) / 1E4 : NaN
        }, zoomY: function () {
            return this.mapSet ? Math.round(1E4 * this.mapContainer.y / this.mapHeight) / 1E4 : NaN
        }, goHome: function () {
            this.selectObject(this.dataProvider);
            var a = {type: "homeButtonClicked", chart: this};
            this.fire(a.type, a)
        }, zoomLevel: function () {
            return Math.round(1E5 *
                this.mapContainer.scale) / 1E5
        }, showDescriptionAndGetUrl: function () {
            var a = this.selectedObject;
            if (a) {
                this.showDescription();
                var b = a.url;
                if (b)d.getURL(b, a.urlTarget); else if (b = a.linkToObject) {
                    if ("string" == typeof b) {
                        var c = this.getObjectById(b);
                        if (c) {
                            this.selectObject(c);
                            return
                        }
                    }
                    b && a.passZoomValuesToTarget && (b.zoomLatitude = this.zoomLatitude(), b.zoomLongitude = this.zoomLongitude(), b.zoomLevel = this.zoomLevel());
                    this.extendMapData(b) || this.selectObject(b)
                }
            }
        }, extendMapData: function (a) {
            var b = a.objectType;
            if ("MapImage" !=
                b && "MapArea" != b && "MapLine" != b)return d.extend(a, new d.MapData, !0), this.dataProvider = a, this.zoomInstantly = !0, this.validateData(), !0
        }, showDescription: function (a) {
            a || (a = this.selectedObject);
            this.allowMultipleDescriptionWindows || this.closeAllDescriptions();
            if (a.description) {
                var b = a.descriptionWindow;
                b && b.close();
                b = new d.DescriptionWindow;
                a.descriptionWindow = b;
                var c = a.descriptionWindowWidth, e = a.descriptionWindowHeight, f = a.descriptionWindowLeft, g = a.descriptionWindowTop, l = a.descriptionWindowRight, h = a.descriptionWindowBottom;
                isNaN(l) || (f = this.realWidth - l);
                isNaN(h) || (g = this.realHeight - h);
                var k = a.descriptionWindowX;
                isNaN(k) || (f = k);
                k = a.descriptionWindowY;
                isNaN(k) || (g = k);
                isNaN(f) && (f = this.mouseX, f = f > this.realWidth / 2 ? f - c - 20 : f + 20);
                isNaN(g) && (g = this.mouseY);
                b.maxHeight = e;
                k = a.title;
                a.titleTr && (k = a.titleTr);
                b.show(this, this.descriptionsDiv, a.description, k);
                a = b.div.style;
                a.position = "absolute";
                a.width = c + "px";
                a.maxHeight = e + "px";
                isNaN(h) || (g -= b.div.offsetHeight);
                isNaN(l) || (f -= b.div.offsetWidth);
                a.left = f + "px";
                a.top = g + "px"
            }
        }, parseXMLObject: function (a) {
            var b =
            {root: {}};
            this.parseXMLNode(b, "root", a);
            this.svgData = b.root.svg;
            this.getBounds()
        }, getBounds: function () {
            var a = this.dataProvider;
            try {
                var b = this.svgData.defs["amcharts:ammap"];
                a.leftLongitude = Number(b.leftLongitude);
                a.rightLongitude = Number(b.rightLongitude);
                a.topLatitude = Number(b.topLatitude);
                a.bottomLatitude = Number(b.bottomLatitude);
                a.projection = b.projection;
                var c = b.wrappedLongitudes;
                c && (a.rightLongitude += 360);
                a.wrappedLongitudes = c
            } catch (e) {
            }
        }, recalcLongitude: function (a) {
            var b = this.dataProvider.leftLongitude,
                c = this.dataProvider.wrappedLongitudes;
            return isNaN(a) && c ? a < b ? Number(a) + 360 : a : a
        }, latitudeToCoordinate: function (a) {
            var b, c = this.dataProvider;
            if (this.mapSet) {
                b = c.topLatitude;
                var e = c.bottomLatitude;
                "mercator" == c.projection && (a = this.mercatorLatitudeToCoordinate(a), b = this.mercatorLatitudeToCoordinate(b), e = this.mercatorLatitudeToCoordinate(e));
                b = (a - b) / (e - b) * this.mapHeight
            }
            return b
        }, longitudeToCoordinate: function (a) {
            a = this.recalcLongitude(a);
            var b, c = this.dataProvider;
            this.mapSet && (b = c.leftLongitude, b = (a -
            b) / (c.rightLongitude - b) * this.mapWidth);
            return b
        }, mercatorLatitudeToCoordinate: function (a) {
            89.5 < a && (a = 89.5);
            -89.5 > a && (a = -89.5);
            a = d.degreesToRadians(a);
            a = .5 * Math.log((1 + Math.sin(a)) / (1 - Math.sin(a)));
            return d.radiansToDegrees(a / 2)
        }, zoomLatitude: function () {
            if (this.mapContainer)return this.coordinateToLatitude((-this.mapContainer.y + this.previousHeight / 2) / this.zoomLevel())
        }, zoomLongitude: function () {
            if (this.mapContainer)return this.coordinateToLongitude((-this.mapContainer.x + this.previousWidth / 2) / this.zoomLevel())
        },
        getAreaCenterLatitude: function (a) {
            a = a.displayObject.getBBox();
            var b = this.mapScale;
            a = -this.mapSet.getBBox().y * b + (a.y + a.height / 2) * b;
            return this.coordinateToLatitude(a)
        }, getAreaCenterLongitude: function (a) {
            a = a.displayObject.getBBox();
            var b = this.mapScale;
            a = -this.mapSet.getBBox().x * b + (a.x + a.width / 2) * b;
            return this.coordinateToLongitude(a)
        }, coordinateToLatitude: function (a) {
            var b;
            if (this.mapSet) {
                var c = this.dataProvider, e = c.bottomLatitude, f = c.topLatitude;
                b = this.mapHeight;
                "mercator" == c.projection ? (c = this.mercatorLatitudeToCoordinate(e),
                    f = this.mercatorLatitudeToCoordinate(f), a = 2 * Math.atan(Math.exp(2 * (a * (c - f) / b + f) * Math.PI / 180)) - .5 * Math.PI, b = d.radiansToDegrees(a)) : b = a / b * (e - f) + f
            }
            return Math.round(1E6 * b) / 1E6
        }, coordinateToLongitude: function (a) {
            var b, c = this.dataProvider;
            this.mapSet && (b = a / this.mapWidth * (c.rightLongitude - c.leftLongitude) + c.leftLongitude);
            return Math.round(1E6 * b) / 1E6
        }, milesToPixels: function (a) {
            var b = this.dataProvider;
            return this.mapWidth / (b.rightLongitude - b.leftLongitude) * a / 69.172
        }, kilometersToPixels: function (a) {
            var b = this.dataProvider;
            return this.mapWidth / (b.rightLongitude - b.leftLongitude) * a / 111.325
        }, handleBackgroundClick: function () {
            if (this.backgroundZoomsToTop && !this.mapWasDragged) {
                var a = this.dataProvider;
                if (this.checkIfClickable(a))this.clickMapObject(a); else {
                    var b = a.zoomX, c = a.zoomY, e = a.zoomLongitude, f = a.zoomLatitude, a = a.zoomLevel;
                    isNaN(b) || isNaN(c) || this.zoomTo(a, b, c);
                    isNaN(e) || isNaN(f) || this.zoomToLongLat(a, e, f, !0)
                }
            }
        }, parseXMLNode: function (a, b, c, e) {
            void 0 === e && (e = "");
            var f, g, d;
            if (c) {
                var h = c.childNodes.length;
                for (f = 0; f < h; f++) {
                    g =
                        c.childNodes[f];
                    var k = g.nodeName, m = g.nodeValue ? this.trim(g.nodeValue) : "", q = !1;
                    g.attributes && 0 < g.attributes.length && (q = !0);
                    if (0 !== g.childNodes.length || "" !== m || !1 !== q)if (3 == g.nodeType || 4 == g.nodeType) {
                        if ("" !== m) {
                            g = 0;
                            for (d in a[b])a[b].hasOwnProperty(d) && g++;
                            g ? a[b]["#text"] = m : a[b] = m
                        }
                    } else if (1 == g.nodeType) {
                        var n;
                        void 0 !== a[b][k] ? void 0 === a[b][k].length ? (n = a[b][k], a[b][k] = [], a[b][k].push(n), a[b][k].push({}), n = a[b][k][1]) : "object" == typeof a[b][k] && (a[b][k].push({}), n = a[b][k][a[b][k].length - 1]) : (a[b][k] =
                        {}, n = a[b][k]);
                        if (g.attributes && g.attributes.length)for (m = 0; m < g.attributes.length; m++)n[g.attributes[m].name] = g.attributes[m].value;
                        void 0 !== a[b][k].length ? this.parseXMLNode(a[b][k], a[b][k].length - 1, g, e + "  ") : this.parseXMLNode(a[b], k, g, e + "  ")
                    }
                }
                g = 0;
                c = "";
                for (d in a[b])"#text" == d ? c = a[b][d] : g++;
                0 === g && void 0 === a[b].length && (a[b] = c)
            }
        }, doDoubleClickZoom: function () {
            if (!this.mapWasDragged) {
                var a = this.zoomLevel() * this.zoomControl.zoomFactor;
                this.zoomToStageXY(a, this.mouseX, this.mouseY)
            }
        }, getDevInfo: function () {
            var a =
                this.zoomLevel(), a = {
                chart: this,
                type: "writeDevInfo",
                zoomLevel: a,
                zoomX: this.zoomX(),
                zoomY: this.zoomY(),
                zoomLatitude: this.zoomLatitude(),
                zoomLongitude: this.zoomLongitude(),
                latitude: this.coordinateToLatitude((this.mouseY - this.mapContainer.y) / a),
                longitude: this.coordinateToLongitude((this.mouseX - this.mapContainer.x) / a),
                left: this.mouseX,
                top: this.mouseY,
                right: this.realWidth - this.mouseX,
                bottom: this.realHeight - this.mouseY,
                percentLeft: Math.round(this.mouseX / this.realWidth * 100) + "%",
                percentTop: Math.round(this.mouseY /
                this.realHeight * 100) + "%",
                percentRight: Math.round((this.realWidth - this.mouseX) / this.realWidth * 100) + "%",
                percentBottom: Math.round((this.realHeight - this.mouseY) / this.realHeight * 100) + "%"
            }, b = "zoomLevel:" + a.zoomLevel + ", zoomLongitude:" + a.zoomLongitude + ", zoomLatitude:" + a.zoomLatitude + "\n", b = b + ("zoomX:" + a.zoomX + ", zoomY:" + a.zoomY + "\n"), b = b + ("latitude:" + a.latitude + ", longitude:" + a.longitude + "\n"), b = b + ("left:" + a.left + ", top:" + a.top + "\n"), b = b + ("right:" + a.right + ", bottom:" + a.bottom + "\n"), b = b + ("left:" + a.percentLeft +
                ", top:" + a.percentTop + "\n"), b = b + ("right:" + a.percentRight + ", bottom:" + a.percentBottom + "\n");
            a.str = b;
            this.fire(a.type, a);
            return a
        }, getXY: function (a, b, c) {
            void 0 !== a && (-1 != String(a).indexOf("%") ? (a = Number(a.split("%").join("")), c && (a = 100 - a), a = Number(a) * b / 100) : c && (a = b - a));
            return a
        }, getObjectById: function (a) {
            var b = this.dataProvider;
            if (b.areas) {
                var c = this.getObject(a, b.areas);
                if (c)return c
            }
            if (c = this.getObject(a, b.images))return c;
            if (a = this.getObject(a, b.lines))return a
        }, getObject: function (a, b) {
            if (b) {
                var c;
                for (c = 0; c < b.length; c++) {
                    var e = b[c];
                    if (e.id == a)return e;
                    if (e.areas) {
                        var f = this.getObject(a, e.areas);
                        if (f)return f
                    }
                    if (f = this.getObject(a, e.images))return f;
                    if (e = this.getObject(a, e.lines))return e
                }
            }
        }, parseData: function () {
            var a = this.dataProvider;
            this.processObject(a.areas, a, "area");
            this.processObject(a.images, a, "image");
            this.processObject(a.lines, a, "line")
        }, processObject: function (a, b, c) {
            if (a) {
                var e;
                for (e = 0; e < a.length; e++) {
                    var f = a[e];
                    f.parentObject = b;
                    "area" == c && d.extend(f, new d.MapArea(this.theme), !0);
                    "image" == c && (f = d.extend(f, new d.MapImage(this.theme), !0));
                    "line" == c && (f = d.extend(f, new d.MapLine(this.theme), !0));
                    a[e] = f;
                    f.areas && this.processObject(f.areas, f, "area");
                    f.images && this.processObject(f.images, f, "image");
                    f.lines && this.processObject(f.lines, f, "line")
                }
            }
        }, positionChanged: function () {
            var a = {
                type: "positionChanged",
                zoomX: this.zoomX(),
                zoomY: this.zoomY(),
                zoomLevel: this.zoomLevel(),
                chart: this
            };
            this.fire(a.type, a)
        }, getX: function (a, b) {
            return this.getXY(a, this.realWidth, b)
        }, getY: function (a, b) {
            return this.getXY(a,
                this.realHeight, b)
        }, trim: function (a) {
            if (a) {
                var b;
                for (b = 0; b < a.length; b++)if (-1 === " \n\r\t\f\x0B\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(a.charAt(b))) {
                    a = a.substring(b);
                    break
                }
                for (b = a.length - 1; 0 <= b; b--)if (-1 === " \n\r\t\f\x0B\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(a.charAt(b))) {
                    a = a.substring(0, b + 1);
                    break
                }
                return -1 === " \n\r\t\f\x0B\u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000".indexOf(a.charAt(0)) ?
                    a : ""
            }
        }, destroy: function () {
            d.AmMap.base.destroy.call(this)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.ZoomControl = d.Class({
        construct: function (a) {
            this.cname = "ZoomControl";
            this.panStepSize = .1;
            this.zoomFactor = 2;
            this.maxZoomLevel = 64;
            this.minZoomLevel = 1;
            this.zoomControlEnabled = this.panControlEnabled = !0;
            this.buttonRollOverColor = "#CC0000";
            this.buttonFillColor = "#990000";
            this.buttonFillAlpha = 1;
            this.buttonBorderColor = "#FFFFFF";
            this.buttonIconAlpha = this.buttonBorderThickness = this.buttonBorderAlpha = 1;
            this.gridColor = "#FFFFFF";
            this.homeIconFile = "homeIcon.gif";
            this.gridBackgroundColor =
                "#000000";
            this.gridBackgroundAlpha = .15;
            this.gridAlpha = 1;
            this.buttonSize = 18;
            this.iconSize = 11;
            this.buttonCornerRadius = 0;
            this.gridHeight = 150;
            this.top = this.left = 10;
            d.applyTheme(this, a, this.cname)
        }, init: function (a, b) {
            var c = this;
            c.chart = a;
            d.remove(c.set);
            var e = b.set();
            d.setCN(a, e, "zoom-control");
            var f = c.buttonSize, g = c.zoomControlEnabled, l = c.panControlEnabled, h = c.buttonFillColor, k = c.buttonFillAlpha, m = c.buttonBorderThickness, q = c.buttonBorderColor, n = c.buttonBorderAlpha, v = c.buttonCornerRadius, u = c.buttonRollOverColor,
                C = c.gridHeight, z = c.zoomFactor, x = c.minZoomLevel, G = c.maxZoomLevel, w = c.buttonIconAlpha, H = a.getX(c.left), r = a.getY(c.top);
            isNaN(c.right) || (H = a.getX(c.right, !0), H = l ? H - 3 * f : H - f);
            isNaN(c.bottom) || (r = a.getY(c.bottom, !0), g && (r -= C + 3 * f), r = l ? r - 3 * f : r + f);
            e.translate(H, r);
            c.previousDY = NaN;
            var t;
            if (g) {
                t = b.set();
                d.setCN(a, t, "zoom-control-zoom");
                e.push(t);
                c.set = e;
                c.zoomSet = t;
                r = d.rect(b, f + 6, C + 2 * f + 6, c.gridBackgroundColor, c.gridBackgroundAlpha, 0, 0, 0, 4);
                d.setCN(a, r, "zoom-bg");
                r.translate(-3, -3);
                r.mouseup(function () {
                    c.handleBgUp()
                }).touchend(function () {
                    c.handleBgUp()
                });
                t.push(r);
                r = new d.SimpleButton;
                r.setIcon(a.pathToImages + "plus.gif", c.iconSize);
                r.setClickHandler(a.zoomIn, a);
                r.init(b, f, f, h, k, m, q, n, v, u, w);
                d.setCN(a, r.set, "zoom-in");
                t.push(r.set);
                r = new d.SimpleButton;
                r.setIcon(a.pathToImages + "minus.gif", c.iconSize);
                r.setClickHandler(a.zoomOut, a);
                r.init(b, f, f, h, k, m, q, n, v, u, w);
                r.set.translate(0, C + f);
                d.setCN(a, r.set, "zoom-out");
                t.push(r.set);
                var H = Math.log(G / x) / Math.log(z) + 1, g = C / H, p;
                for (p = 1; p < H; p++)r = f + p * g, r = d.line(b, [1, f - 2], [r, r], c.gridColor, c.gridAlpha, 1), d.setCN(a,
                    r, "zoom-grid"), t.push(r);
                r = new d.SimpleButton;
                r.setDownHandler(c.draggerDown, c);
                r.setClickHandler(c.draggerUp, c);
                r.init(b, f, g, h, k, m, q, n, v, u);
                d.setCN(a, r.set, "zoom-dragger");
                t.push(r.set);
                c.dragger = r.set;
                c.previousY = NaN;
                C -= g;
                x = Math.log(x / 100) / Math.log(z);
                z = Math.log(G / 100) / Math.log(z);
                c.realStepSize = C / (z - x);
                c.realGridHeight = C;
                c.stepMax = z
            }
            l && (l = b.set(), d.setCN(a, l, "zoom-control-pan"), e.push(l), t && t.translate(f, 4 * f), t = new d.SimpleButton, t.setIcon(a.pathToImages + "panLeft.gif", c.iconSize), t.setClickHandler(a.moveLeft,
                a), t.init(b, f, f, h, k, m, q, n, v, u, w), t.set.translate(0, f), d.setCN(a, t.set, "pan-left"), l.push(t.set), t = new d.SimpleButton, t.setIcon(a.pathToImages + "panRight.gif", c.iconSize), t.setClickHandler(a.moveRight, a), t.init(b, f, f, h, k, m, q, n, v, u, w), t.set.translate(2 * f, f), d.setCN(a, t.set, "pan-right"), l.push(t.set), t = new d.SimpleButton, t.setIcon(a.pathToImages + "panUp.gif", c.iconSize), t.setClickHandler(a.moveUp, a), t.init(b, f, f, h, k, m, q, n, v, u, w), t.set.translate(f, 0), d.setCN(a, t.set, "pan-up"), l.push(t.set), t = new d.SimpleButton,
                t.setIcon(a.pathToImages + "panDown.gif", c.iconSize), t.setClickHandler(a.moveDown, a), t.init(b, f, f, h, k, m, q, n, v, u, w), t.set.translate(f, 2 * f), d.setCN(a, t.set, "pan-down"), l.push(t.set), k = new d.SimpleButton, k.setIcon(a.pathToImages + c.homeIconFile, c.iconSize), k.setClickHandler(a.goHome, a), k.init(b, f, f, h, 0, 0, q, 0, v, u, w), k.set.translate(f, f), d.setCN(a, k.set, "pan-home"), l.push(k.set), e.push(l))
        }, draggerDown: function () {
            this.chart.stopDrag();
            this.isDragging = !0
        }, draggerUp: function () {
            this.isDragging = !1
        }, handleBgUp: function () {
            var a =
                this.chart, b = 100 * Math.pow(this.zoomFactor, this.stepMax - (a.mouseY - this.zoomSet.y - this.set.y - this.buttonSize - this.realStepSize / 2) / this.realStepSize);
            a.zoomTo(b)
        }, update: function () {
            var a, b = this.zoomFactor, c = this.realStepSize, e = this.stepMax, f = this.dragger, g = this.buttonSize, l = this.chart;
            this.isDragging ? (l.stopDrag(), a = f.y + (l.mouseY - this.previousY), a = d.fitToBounds(a, g, this.realGridHeight + g), c = 100 * Math.pow(b, e - (a - g) / c), l.zoomTo(c, NaN, NaN, !0)) : (a = Math.log(l.zoomLevel() / 100) / Math.log(b), a = (e - a) * c + g);
            this.previousY =
                l.mouseY;
            this.previousDY != a && f && (f.translate(0, a), this.previousDY = a)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.SimpleButton = d.Class({
        construct: function () {
        }, init: function (a, b, c, e, f, g, l, h, k, m, q) {
            var n = this;
            n.rollOverColor = m;
            n.color = e;
            m = a.set();
            n.set = m;
            e = d.rect(a, b, c, e, f, g, l, h, k);
            m.push(e);
            if (f = n.iconPath)g = n.iconSize, a = a.image(f, (b - g) / 2, (c - g) / 2, g, g), m.push(a), a.setAttr("opacity", q), a.mousedown(function () {
                n.handleDown()
            }).mouseup(function () {
                n.handleUp()
            }).mouseover(function () {
                n.handleOver()
            }).mouseout(function () {
                n.handleOut()
            });
            e.mousedown(function () {
                n.handleDown()
            }).touchstart(function () {
                n.handleDown()
            }).mouseup(function () {
                n.handleUp()
            }).touchend(function () {
                n.handleUp()
            }).mouseover(function () {
                n.handleOver()
            }).mouseout(function () {
                n.handleOut()
            });
            n.bg = e
        }, setIcon: function (a, b) {
            this.iconPath = a;
            this.iconSize = b
        }, setClickHandler: function (a, b) {
            this.clickHandler = a;
            this.scope = b
        }, setDownHandler: function (a, b) {
            this.downHandler = a;
            this.scope = b
        }, handleUp: function () {
            var a = this.clickHandler;
            a && a.call(this.scope)
        }, handleDown: function () {
            var a = this.downHandler;
            a && a.call(this.scope)
        }, handleOver: function () {
            this.bg.setAttr("fill", this.rollOverColor)
        }, handleOut: function () {
            this.bg.setAttr("fill", this.color)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.SmallMap = d.Class({
        construct: function (a) {
            this.cname = "SmallMap";
            this.mapColor = "#e6e6e6";
            this.rectangleColor = "#FFFFFF";
            this.top = this.right = 10;
            this.minimizeButtonWidth = 16;
            this.backgroundColor = "#9A9A9A";
            this.backgroundAlpha = 1;
            this.borderColor = "#FFFFFF";
            this.borderThickness = 3;
            this.borderAlpha = 1;
            this.size = .2;
            this.enabled = !0;
            d.applyTheme(this, a, this.cname)
        }, init: function (a, b) {
            var c = this;
            if (c.enabled) {
                c.chart = a;
                c.container = b;
                c.width = a.realWidth * c.size;
                c.height = a.realHeight *
                c.size;
                d.remove(c.set);
                var e = b.set();
                c.set = e;
                d.setCN(a, e, "small-map");
                var f = b.set();
                c.allSet = f;
                e.push(f);
                c.buildSVGMap();
                var g = c.borderThickness, l = c.borderColor, h = d.rect(b, c.width + g, c.height + g, c.backgroundColor, c.backgroundAlpha, g, l, c.borderAlpha);
                d.setCN(a, h, "small-map-bg");
                h.translate(-g / 2, -g / 2);
                f.push(h);
                h.toBack();
                var k, m, h = c.minimizeButtonWidth, q = new d.SimpleButton;
                q.setIcon(a.pathToImages + "arrowDown.gif", h);
                q.setClickHandler(c.minimize, c);
                q.init(b, h, h, l, 1, 1, l, 1);
                d.setCN(a, q.set, "small-map-down");
                q = q.set;
                c.downButtonSet = q;
                e.push(q);
                var n = new d.SimpleButton;
                n.setIcon(a.pathToImages + "arrowUp.gif", h);
                n.setClickHandler(c.maximize, c);
                n.init(b, h, h, l, 1, 1, l, 1);
                d.setCN(a, n.set, "small-map-up");
                l = n.set;
                c.upButtonSet = l;
                l.hide();
                e.push(l);
                var v, u;
                isNaN(c.top) || (k = a.getY(c.top) + g, u = 0);
                isNaN(c.bottom) || (k = a.getY(c.bottom, !0) - c.height - g, u = c.height - h + g / 2);
                isNaN(c.left) || (m = a.getX(c.left) + g, v = -g / 2);
                isNaN(c.right) || (m = a.getX(c.right, !0) - c.width - g, v = c.width - h + g / 2);
                g = b.set();
                g.clipRect(1, 1, c.width, c.height);
                f.push(g);
                c.rectangleC = g;
                e.translate(m, k);
                q.translate(v, u);
                l.translate(v, u);
                f.mouseup(function () {
                    c.handleMouseUp()
                });
                c.drawRectangle()
            } else d.remove(c.allSet), d.remove(c.downButtonSet), d.remove(c.upButtonSet)
        }, minimize: function () {
            this.downButtonSet.hide();
            this.upButtonSet.show();
            this.allSet.hide()
        }, maximize: function () {
            this.downButtonSet.show();
            this.upButtonSet.hide();
            this.allSet.show()
        }, buildSVGMap: function () {
            var a = this.chart, b = {
                    fill: this.mapColor,
                    stroke: this.mapColor,
                    "stroke-opacity": 1
                }, c = a.svgData.g.path,
                e = this.container, f = e.set();
            d.setCN(a, f, "small-map-image");
            var g;
            for (g = 0; g < c.length; g++) {
                var l = e.path(c[g].d).attr(b);
                f.push(l)
            }
            this.allSet.push(f);
            b = f.getBBox();
            c = this.size * a.mapScale;
            e = -b.x * c;
            g = -b.y * c;
            var h = l = 0;
            a.centerMap && (l = (this.width - b.width * c) / 2, h = (this.height - b.height * c) / 2);
            this.mapWidth = b.width * c;
            this.mapHeight = b.height * c;
            this.dx = l;
            this.dy = h;
            f.translate(e + l, g + h, c)
        }, update: function () {
            var a = this.chart, b = a.zoomLevel(), c = this.width, e = a.mapContainer, a = c / (a.realWidth * b), c = c / b, b = this.height / b, f =
                this.rectangle;
            f.translate(-e.x * a + this.dx, -e.y * a + this.dy);
            0 < c && 0 < b && (f.setAttr("width", Math.ceil(c + 1)), f.setAttr("height", Math.ceil(b + 1)));
            this.rWidth = c;
            this.rHeight = b
        }, drawRectangle: function () {
            var a = this.rectangle;
            d.remove(a);
            a = d.rect(this.container, 10, 10, "#000", 0, 1, this.rectangleColor, 1);
            d.setCN(this.chart, a, "small-map-rectangle");
            this.rectangleC.push(a);
            this.rectangle = a
        }, handleMouseUp: function () {
            var a = this.chart, b = a.zoomLevel();
            a.zoomTo(b, -((a.mouseX - this.set.x - this.dx - this.rWidth / 2) / this.mapWidth) *
            b, -((a.mouseY - this.set.y - this.dy - this.rHeight / 2) / this.mapHeight) * b)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.AreasProcessor = d.Class({
        construct: function (a) {
            this.chart = a
        }, process: function (a) {
            this.updateAllAreas();
            this.allObjects = [];
            a = a.areas;
            var b = this.chart, c, e = a.length, f, g, l = 0, h = b.svgAreasById, k = !1, m = !1, q = 0;
            for (f = 0; f < e; f++) {
                g = a[f];
                g = g.value;
                if (!1 === k || k < g)k = g;
                if (!1 === m || m > g)m = g;
                isNaN(g) || (l += Math.abs(g), q++)
            }
            isNaN(b.minValue) || (m = b.minValue);
            isNaN(b.maxValue) || (k = b.maxValue);
            b.maxValueReal = k;
            b.minValueReal = m;
            for (f = 0; f < e; f++)g = a[f], isNaN(g.value) ? g.percents = void 0 : (g.percents =
                (g.value - m) / l * 100, m == k && (g.percents = 100));
            for (f = 0; f < e; f++) {
                g = a[f];
                var n = h[g.id];
                c = b.areasSettings;
                n && n.className && (l = b.areasClasses[n.className]) && (c = l, c = d.processObject(c, d.AreasSettings, b.theme));
                var v = c.color, u = c.alpha, C = c.outlineThickness, z = c.rollOverColor, x = c.selectedColor, G = c.rollOverAlpha, w = c.outlineColor, H = c.outlineAlpha, r = c.balloonText, t = c.selectable, p = c.pattern, B = c.rollOverOutlineColor, y = c.bringForwardOnHover, N = c.preserveOriginalAttributes;
                this.allObjects.push(g);
                g.chart = b;
                g.baseSettings =
                    c;
                g.autoZoomReal = void 0 == g.autoZoom ? c.autoZoom : g.autoZoom;
                l = g.color;
                void 0 == l && (l = v);
                q = g.alpha;
                isNaN(q) && (q = u);
                u = g.rollOverAlpha;
                isNaN(u) && (u = G);
                isNaN(u) && (u = q);
                G = g.rollOverColor;
                void 0 == G && (G = z);
                z = g.pattern;
                void 0 == z && (z = p);
                p = g.selectedColor;
                void 0 == p && (p = x);
                (x = g.balloonText) || (x = r);
                void 0 == c.colorSolid || isNaN(g.value) || (r = Math.floor((g.value - m) / ((k - m) / b.colorSteps)), r == b.colorSteps && r--, r *= 1 / (b.colorSteps - 1), k == m && (r = 1), g.colorReal = d.getColorFade(l, c.colorSolid, r));
                void 0 != g.color && (g.colorReal =
                    g.color);
                void 0 == g.selectable && (g.selectable = t);
                void 0 == g.colorReal && (g.colorReal = v);
                v = g.outlineColor;
                void 0 == v && (v = w);
                w = g.outlineAlpha;
                isNaN(w) && (w = H);
                H = g.outlineThickness;
                isNaN(H) && (H = C);
                C = g.rollOverOutlineColor;
                void 0 == C && (C = B);
                void 0 == g.bringForwardOnHover && (g.bringForwardOnHover = y);
                void 0 == g.preserveOriginalAttributes && (g.preserveOriginalAttributes = N);
                g.alphaReal = q;
                g.rollOverColorReal = G;
                g.rollOverAlphaReal = u;
                g.balloonTextReal = x;
                g.selectedColorReal = p;
                g.outlineColorReal = v;
                g.outlineAlphaReal = w;
                g.rollOverOutlineColorReal = C;
                g.outlineThicknessReal = H;
                g.patternReal = z;
                d.processDescriptionWindow(c, g);
                if (n && (c = n.area, B = n.title, g.enTitle = n.title, B && !g.title && (g.title = B), (n = b.language) ? (B = d.mapTranslations) && (n = B[n]) && n[g.enTitle] && (g.titleTr = n[g.enTitle]) : g.titleTr = void 0, c)) {
                    g.displayObject = c;
                    g.mouseEnabled && b.addObjectEventListeners(c, g);
                    var E;
                    void 0 != l && (E = l);
                    void 0 != g.colorReal && (E = g.showAsSelected || b.selectedObject == g ? g.selectedColorReal : g.colorReal);
                    c.node.setAttribute("class", "");
                    d.setCN(b,
                        c, "map-area");
                    d.setCN(b, c, "map-area-" + c.id);
                    g.preserveOriginalAttributes || (c.setAttr("fill", E), c.setAttr("stroke", v), c.setAttr("stroke-opacity", w), c.setAttr("stroke-width", H), c.setAttr("fill-opacity", q));
                    z && c.pattern(z, b.mapScale, b.path);
                    g.hidden && c.hide()
                }
            }
        }, updateAllAreas: function () {
            var a = this.chart, b = a.areasSettings, c = b.unlistedAreasColor, e = b.unlistedAreasAlpha, f = b.unlistedAreasOutlineColor, g = b.unlistedAreasOutlineAlpha, l = a.svgAreas, h = a.dataProvider, k = h.areas, m = {}, q;
            for (q = 0; q < k.length; q++)m[k[q].id] =
                k[q];
            for (q = 0; q < l.length; q++) {
                k = l[q];
                if (b.preserveOriginalAttributes) {
                    if (k.customAttr)for (var n in k.customAttr)k.setAttr(n, k.customAttr[n])
                } else void 0 != c && k.setAttr("fill", c), isNaN(e) || k.setAttr("fill-opacity", e), void 0 != f && k.setAttr("stroke", f), isNaN(g) || k.setAttr("stroke-opacity", g), k.setAttr("stroke-width", b.outlineThickness);
                d.setCN(a, k, "map-area-unlisted");
                if (h.getAreasFromMap && !m[k.id]) {
                    var v = new d.MapArea(a.theme);
                    v.parentObject = h;
                    v.id = k.id;
                    h.areas.push(v)
                }
            }
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.AreasSettings = d.Class({
        construct: function (a) {
            this.cname = "AreasSettings";
            this.alpha = 1;
            this.autoZoom = !1;
            this.balloonText = "[[title]]";
            this.color = "#FFCC00";
            this.colorSolid = "#990000";
            this.unlistedAreasAlpha = 1;
            this.unlistedAreasColor = "#DDDDDD";
            this.outlineColor = "#FFFFFF";
            this.outlineAlpha = 1;
            this.outlineThickness = .5;
            this.selectedColor = this.rollOverOutlineColor = "#CC0000";
            this.unlistedAreasOutlineColor = "#FFFFFF";
            this.unlistedAreasOutlineAlpha = 1;
            this.descriptionWindowWidth =
                250;
            this.adjustOutlineThickness = !1;
            this.bringForwardOnHover = !0;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.ImagesProcessor = d.Class({
        construct: function (a) {
            this.chart = a;
            this.reset()
        }, process: function (a) {
            var b = a.images, c;
            for (c = 0; c < b.length; c++)this.createImage(b[c], c);
            a.parentObject && a.remainVisible && this.process(a.parentObject)
        }, createImage: function (a, b) {
            var c = this.chart, e = c.container, f = c.mapImagesContainer, g = c.stageImagesContainer, l = c.imagesSettings;
            a.remove && a.remove();
            var h = l.color, k = l.alpha, m = l.rollOverColor, q = l.selectedColor, n = l.balloonText, v = l.outlineColor, u = l.outlineAlpha,
                C = l.outlineThickness, z = l.selectedScale, x = l.labelPosition, G = l.labelColor, w = l.labelFontSize, H = l.bringForwardOnHover, r = l.labelRollOverColor, t = l.selectedLabelColor;
            a.index = b;
            a.chart = c;
            a.baseSettings = c.imagesSettings;
            var p = e.set();
            a.displayObject = p;
            var B = a.color;
            void 0 == B && (B = h);
            h = a.alpha;
            isNaN(h) && (h = k);
            void 0 == a.bringForwardOnHover && (a.bringForwardOnHover = H);
            k = a.outlineAlpha;
            isNaN(k) && (k = u);
            u = a.rollOverColor;
            void 0 == u && (u = m);
            m = a.selectedColor;
            void 0 == m && (m = q);
            (q = a.balloonText) || (q = n);
            n = a.outlineColor;
            void 0 == n && (n = v);
            void 0 == n && (n = B);
            v = a.outlineThickness;
            isNaN(v) && (v = C);
            (C = a.labelPosition) || (C = x);
            x = a.labelColor;
            void 0 == x && (x = G);
            G = a.labelRollOverColor;
            void 0 == G && (G = r);
            r = a.selectedLabelColor;
            void 0 == r && (r = t);
            t = a.labelFontSize;
            isNaN(t) && (t = w);
            w = a.selectedScale;
            isNaN(w) && (w = z);
            isNaN(a.rollOverScale);
            a.colorReal = B;
            a.alphaReal = h;
            a.rollOverColorReal = u;
            a.balloonTextReal = q;
            a.selectedColorReal = m;
            a.labelColorReal = x;
            a.labelRollOverColorReal = G;
            a.selectedLabelColorReal = r;
            a.labelFontSizeReal = t;
            a.labelPositionReal =
                C;
            a.selectedScaleReal = w;
            a.rollOverScaleReal = w;
            d.processDescriptionWindow(l, a);
            a.centeredReal = void 0 == a.centered ? l.centered : a.centered;
            t = a.type;
            r = a.imageURL;
            G = a.svgPath;
            u = a.width;
            x = a.height;
            z = a.scale;
            isNaN(a.percentWidth) || (u = a.percentWidth / 100 * c.realWidth);
            isNaN(a.percentHeight) || (x = a.percentHeight / 100 * c.realHeight);
            var y;
            r || t || G || (t = "circle", u = 1, k = h = 0);
            m = w = 0;
            l = a.selectedColorReal;
            if (t) {
                isNaN(u) && (u = 10);
                isNaN(x) && (x = 10);
                "kilometers" == a.widthAndHeightUnits && (u = c.kilometersToPixels(a.width), x = c.kilometersToPixels(a.height));
                "miles" == a.widthAndHeightUnits && (u = c.milesToPixels(a.width), x = c.milesToPixels(a.height));
                if ("circle" == t || "bubble" == t)x = u;
                y = this.createPredefinedImage(B, n, v, t, u, x);
                m = w = 0;
                a.centeredReal ? (isNaN(a.right) || (w = u * z), isNaN(a.bottom) || (m = x * z)) : (w = u * z / 2, m = x * z / 2);
                y.translate(w, m, z)
            } else r ? (isNaN(u) && (u = 10), isNaN(x) && (x = 10), y = e.image(r, 0, 0, u, x), y.node.setAttribute("preserveAspectRatio", "none"), y.setAttr("opacity", h), a.centeredReal && (w = isNaN(a.right) ? -u / 2 : u / 2, m = isNaN(a.bottom) ? -x / 2 : x / 2, y.translate(w, m))) : G && (y =
                e.path(G), n = y.getBBox(), a.centeredReal ? (w = -n.x * z - n.width * z / 2, isNaN(a.right) || (w = -w), m = -n.y * z - n.height * z / 2, isNaN(a.bottom) || (m = -m)) : w = m = 0, y.translate(w, m, z), y.x = w, y.y = m);
            y && (p.push(y), a.image = y, y.setAttr("stroke-opacity", k), y.setAttr("fill-opacity", h), y.setAttr("fill", B), d.setCN(c, y, "map-image"), void 0 != a.id && d.setCN(c, y, "map-image-" + a.id));
            B = a.labelColorReal;
            !a.showAsSelected && c.selectedObject != a || void 0 == l || (y.setAttr("fill", l), B = a.selectedLabelColorReal);
            y = null;
            void 0 !== a.label && (y = d.text(e, a.label,
                B, c.fontFamily, a.labelFontSizeReal, a.labelAlign), d.setCN(c, y, "map-image-label"), void 0 !== a.id && d.setCN(c, y, "map-image-label-" + a.id), B = a.labelBackgroundAlpha, (h = a.labelBackgroundColor) && 0 < B && (k = y.getBBox(), e = d.rect(e, k.width + 16, k.height + 10, h, B), d.setCN(c, e, "map-image-label-background"), void 0 != a.id && d.setCN(c, e, "map-image-label-background-" + a.id), p.push(e), a.labelBG = e), a.imageLabel = y, p.push(y), d.setCN(c, p, "map-image-container"), void 0 != a.id && d.setCN(c, p, "map-image-container-" + a.id));
            isNaN(a.latitude) ||
            isNaN(a.longitude) ? g.push(p) : f.push(p);
            p && (p.rotation = a.rotation);
            this.updateSizeAndPosition(a);
            a.mouseEnabled && c.addObjectEventListeners(p, a);
            a.hidden && p.hide()
        }, updateSizeAndPosition: function (a) {
            var b = this.chart, c = a.displayObject, e = b.getX(a.left), f = b.getY(a.top), g = a.image.getBBox();
            isNaN(a.right) || (e = b.getX(a.right, !0) - g.width * a.scale);
            isNaN(a.bottom) || (f = b.getY(a.bottom, !0) - g.height * a.scale);
            var d = a.longitude, h = a.latitude, g = this.objectsToResize;
            this.allSvgObjects.push(c);
            this.allObjects.push(a);
            var k = a.imageLabel;
            if (!isNaN(e) && !isNaN(f))c.translate(e, f); else if (!isNaN(h) && !isNaN(d) && (e = b.longitudeToCoordinate(d), f = b.latitudeToCoordinate(h), c.translate(e, f, NaN, !0), a.fixedSize)) {
                e = 1;
                if (a.showAsSelected || b.selectedObject == a)e = a.selectedScaleReal;
                g.push({image: c, scale: e})
            }
            this.positionLabel(k, a, a.labelPositionReal)
        }, positionLabel: function (a, b, c) {
            if (a) {
                var e = b.image, f = 0, g = 0, d = 0, h = 0;
                e && (h = e.getBBox(), g = e.y, f = e.x, d = h.width, h = h.height, b.svgPath && (d *= b.scale, h *= b.scale));
                var e = a.getBBox(), k = e.width,
                    m = e.height;
                "right" == c && (f += d + k / 2 + 5, g += h / 2 - 2);
                "left" == c && (f += -k / 2 - 5, g += h / 2 - 2);
                "top" == c && (g -= m / 2 + 3, f += d / 2);
                "bottom" == c && (g += h + m / 2, f += d / 2);
                "middle" == c && (f += d / 2, g += h / 2);
                a.translate(f + b.labelShiftX, g + b.labelShiftY);
                b.labelBG && b.labelBG.translate(f - e.width / 2 + b.labelShiftX - 9, g + b.labelShiftY - e.height / 2 - 3)
            }
        }, createPredefinedImage: function (a, b, c, e, f, g) {
            var l = this.chart.container, h;
            switch (e) {
                case "circle":
                    h = d.circle(l, f / 2, a, 1, c, b, 1);
                    break;
                case "rectangle":
                    h = d.polygon(l, [-f / 2, f / 2, f / 2, -f / 2], [g / 2, g / 2, -g / 2, -g / 2],
                        a, 1, c, b, 1);
                    break;
                case "bubble":
                    h = d.circle(l, f / 2, a, 1, c, b, 1, !0)
            }
            return h
        }, reset: function () {
            this.objectsToResize = [];
            this.allSvgObjects = [];
            this.allObjects = [];
            this.allLabels = []
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.ImagesSettings = d.Class({
        construct: function (a) {
            this.cname = "ImagesSettings";
            this.balloonText = "[[title]]";
            this.alpha = 1;
            this.borderAlpha = 0;
            this.borderThickness = 1;
            this.labelPosition = "right";
            this.labelColor = "#000000";
            this.labelFontSize = 11;
            this.color = "#000000";
            this.labelRollOverColor = "#00CC00";
            this.centered = !0;
            this.rollOverScale = this.selectedScale = 1;
            this.descriptionWindowWidth = 250;
            this.bringForwardOnHover = !0;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.LinesProcessor = d.Class({
        construct: function (a) {
            this.chart = a;
            this.reset()
        }, process: function (a) {
            var b = a.lines, c = this.chart, e = c.linesSettings, f = this.objectsToResize, g = c.mapLinesContainer, l = c.stageLinesContainer, h = e.thickness, k = e.dashLength, m = e.arrow, q = e.arrowSize, n = e.arrowColor, v = e.arrowAlpha, u = e.color, C = e.alpha, z = e.rollOverColor, x = e.selectedColor, G = e.rollOverAlpha, w = e.balloonText, H = e.bringForwardOnHover, r = c.container, t;
            for (t = 0; t < b.length; t++) {
                var p = b[t];
                p.chart = c;
                p.baseSettings = e;
                var B = r.set();
                p.displayObject = B;
                this.allSvgObjects.push(B);
                this.allObjects.push(p);
                p.mouseEnabled && c.addObjectEventListeners(B, p);
                if (p.remainVisible || c.selectedObject == p.parentObject) {
                    var y = p.thickness;
                    isNaN(y) && (y = h);
                    var N = p.dashLength;
                    isNaN(N) && (N = k);
                    var E = p.color;
                    void 0 == E && (E = u);
                    var A = p.alpha;
                    isNaN(A) && (A = C);
                    var D = p.rollOverAlpha;
                    isNaN(D) && (D = G);
                    isNaN(D) && (D = A);
                    var I = p.rollOverColor;
                    void 0 == I && (I = z);
                    var U = p.selectedColor;
                    void 0 == U && (U = x);
                    var S = p.balloonText;
                    S || (S = w);
                    var L = p.arrow;
                    if (!L || "none" == L && "none" != m)L = m;
                    var O = p.arrowColor;
                    void 0 == O && (O = n);
                    void 0 == O && (O = E);
                    var P = p.arrowAlpha;
                    isNaN(P) && (P = v);
                    isNaN(P) && (P = A);
                    var M = p.arrowSize;
                    isNaN(M) && (M = q);
                    p.alphaReal = A;
                    p.colorReal = E;
                    p.rollOverColorReal = I;
                    p.rollOverAlphaReal = D;
                    p.balloonTextReal = S;
                    p.selectedColorReal = U;
                    p.thicknessReal = y;
                    void 0 == p.bringForwardOnHover && (p.bringForwardOnHover = H);
                    d.processDescriptionWindow(e, p);
                    var D = this.processCoordinates(p.x, c.realWidth), I = this.processCoordinates(p.y, c.realHeight), K = p.longitudes, S = p.latitudes,
                        J = K.length, Q;
                    if (0 < J)for (D = [], Q = 0; Q < J; Q++)D.push(c.longitudeToCoordinate(K[Q]));
                    J = S.length;
                    if (0 < J)for (I = [], Q = 0; Q < J; Q++)I.push(c.latitudeToCoordinate(S[Q]));
                    if (0 < D.length) {
                        d.dx = 0;
                        d.dy = 0;
                        K = d.line(r, D, I, E, 1, y, N, !1, !1, !0);
                        d.setCN(c, K, "map-line");
                        void 0 != p.id && d.setCN(c, K, "map-line-" + p.id);
                        N = d.line(r, D, I, E, .001, 3, N, !1, !1, !0);
                        d.dx = .5;
                        d.dy = .5;
                        B.push(K);
                        B.push(N);
                        B.setAttr("opacity", A);
                        if ("none" != L) {
                            var F, R, T;
                            if ("end" == L || "both" == L)A = D[D.length - 1], E = I[I.length - 1], 1 < D.length ? (J = D[D.length - 2], F = I[I.length - 2]) :
                                (J = A, F = E), F = 180 * Math.atan((E - F) / (A - J)) / Math.PI, R = A, T = E, F = 0 > A - J ? F - 90 : F + 90;
                            "both" == L && (A = d.polygon(r, [-M / 2, 0, M / 2], [1.5 * M, 0, 1.5 * M], O, P, 1, O, P), B.push(A), A.translate(R, T), A.rotate(F), d.setCN(c, K, "map-line-arrow"), void 0 != p.id && d.setCN(c, K, "map-line-arrow-" + p.id), p.fixedSize && f.push(A));
                            if ("start" == L || "both" == L)A = D[0], T = I[0], 1 < D.length ? (E = D[1], R = I[1]) : (E = A, R = T), F = 180 * Math.atan((T - R) / (A - E)) / Math.PI, R = A, F = 0 > A - E ? F - 90 : F + 90;
                            "middle" == L && (A = D[D.length - 1], E = I[I.length - 1], 1 < D.length ? (J = D[D.length - 2], F = I[I.length -
                            2]) : (J = A, F = E), R = J + (A - J) / 2, T = F + (E - F) / 2, F = 180 * Math.atan((E - F) / (A - J)) / Math.PI, F = 0 > A - J ? F - 90 : F + 90);
                            A = d.polygon(r, [-M / 2, 0, M / 2], [1.5 * M, 0, 1.5 * M], O, P, 1, O, P);
                            d.setCN(c, K, "map-line-arrow");
                            void 0 != p.id && d.setCN(c, K, "map-line-arrow-" + p.id);
                            B.push(A);
                            A.translate(R, T);
                            A.rotate(F);
                            p.fixedSize && f.push(A);
                            p.arrowSvg = A
                        }
                        p.fixedSize && K && (this.linesToResize.push({
                            line: K,
                            thickness: y
                        }), this.linesToResize.push({line: N, thickness: 3}));
                        p.lineSvg = K;
                        p.showAsSelected && !isNaN(U) && K.setAttr("stroke", U);
                        0 < S.length ? g.push(B) : l.push(B);
                        p.hidden && B.hide()
                    }
                }
            }
            a.parentObject && a.remainVisible && this.process(a.parentObject)
        }, processCoordinates: function (a, b) {
            var c = [], e;
            for (e = 0; e < a.length; e++) {
                var f = a[e], g = Number(f);
                isNaN(g) && (g = Number(f.replace("%", "")) * b / 100);
                isNaN(g) || c.push(g)
            }
            return c
        }, reset: function () {
            this.objectsToResize = [];
            this.allSvgObjects = [];
            this.allObjects = [];
            this.linesToResize = []
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.LinesSettings = d.Class({
        construct: function (a) {
            this.cname = "LinesSettings";
            this.balloonText = "[[title]]";
            this.thickness = 1;
            this.dashLength = 0;
            this.arrowSize = 10;
            this.arrowAlpha = 1;
            this.arrow = "none";
            this.color = "#990000";
            this.descriptionWindowWidth = 250;
            this.bringForwardOnHover = !0;
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.MapObject = d.Class({
        construct: function (a) {
            this.fixedSize = this.mouseEnabled = !0;
            this.images = [];
            this.lines = [];
            this.areas = [];
            this.remainVisible = !0;
            this.passZoomValuesToTarget = !1;
            this.objectType = this.cname;
            d.applyTheme(this, a, "MapObject")
        }
    })
})();
(function (d) {
    d = window.AmCharts;
    d.MapArea = d.Class({
        inherits: d.MapObject, construct: function (a) {
            this.cname = "MapArea";
            d.MapArea.base.construct.call(this, a);
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.MapLine = d.Class({
        inherits: d.MapObject, construct: function (a) {
            this.cname = "MapLine";
            this.longitudes = [];
            this.latitudes = [];
            this.x = [];
            this.y = [];
            this.arrow = "none";
            d.MapLine.base.construct.call(this, a);
            d.applyTheme(this, a, this.cname)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.MapImage = d.Class({
        inherits: d.MapObject, construct: function (a) {
            this.cname = "MapImage";
            this.scale = 1;
            this.widthAndHeightUnits = "pixels";
            this.labelShiftY = this.labelShiftX = 0;
            d.MapImage.base.construct.call(this, a);
            d.applyTheme(this, a, this.cname)
        }, remove: function () {
            var a = this.displayObject;
            a && a.remove();
            (a = this.imageLabel) && a.remove()
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.degreesToRadians = function (a) {
        return a / 180 * Math.PI
    };
    d.radiansToDegrees = function (a) {
        return a / Math.PI * 180
    };
    d.getColorFade = function (a, b, c) {
        var e = d.hex2RGB(b);
        b = e[0];
        var f = e[1], e = e[2], g = d.hex2RGB(a);
        a = g[0];
        var l = g[1], g = g[2];
        a += Math.round((b - a) * c);
        l += Math.round((f - l) * c);
        g += Math.round((e - g) * c);
        return "rgb(" + a + "," + l + "," + g + ")"
    };
    d.hex2RGB = function (a) {
        return [parseInt(a.substring(1, 3), 16), parseInt(a.substring(3, 5), 16), parseInt(a.substring(5, 7), 16)]
    };
    d.processDescriptionWindow =
        function (a, b) {
            isNaN(b.descriptionWindowX) && (b.descriptionWindowX = a.descriptionWindowX);
            isNaN(b.descriptionWindowY) && (b.descriptionWindowY = a.descriptionWindowY);
            isNaN(b.descriptionWindowLeft) && (b.descriptionWindowLeft = a.descriptionWindowLeft);
            isNaN(b.descriptionWindowRight) && (b.descriptionWindowRight = a.descriptionWindowRight);
            isNaN(b.descriptionWindowTop) && (b.descriptionWindowTop = a.descriptionWindowTop);
            isNaN(b.descriptionWindowBottom) && (b.descriptionWindowBottom = a.descriptionWindowBottom);
            isNaN(b.descriptionWindowWidth) &&
            (b.descriptionWindowWidth = a.descriptionWindowWidth);
            isNaN(b.descriptionWindowHeight) && (b.descriptionWindowHeight = a.descriptionWindowHeight)
        }
})();
(function () {
    var d = window.AmCharts;
    d.MapData = d.Class({
        inherits: d.MapObject, construct: function () {
            this.cname = "MapData";
            d.MapData.base.construct.call(this);
            this.projection = "mercator";
            this.topLatitude = 90;
            this.bottomLatitude = -90;
            this.leftLongitude = -180;
            this.rightLongitude = 180;
            this.zoomLevel = 1;
            this.getAreasFromMap = !1
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.DescriptionWindow = d.Class({
        construct: function () {
        }, show: function (a, b, c, e) {
            var f = this, g = document.createElement("div");
            g.style.position = "absolute";
            var d = a.classNamePrefix + "-description-";
            g.className = "ammapDescriptionWindow " + d + "div";
            f.div = g;
            b.appendChild(g);
            var h = document.createElement("img");
            h.className = "ammapDescriptionWindowCloseButton " + d + "close-img";
            h.src = a.pathToImages + "xIcon.gif";
            h.style.cssFloat = "right";
            h.onclick = function () {
                f.close()
            };
            h.onmouseover = function () {
                h.src =
                    a.pathToImages + "xIconH.gif"
            };
            h.onmouseout = function () {
                h.src = a.pathToImages + "xIcon.gif"
            };
            g.appendChild(h);
            b = document.createElement("div");
            b.className = "ammapDescriptionTitle " + d + "title-div";
            b.onmousedown = function () {
                f.div.style.zIndex = 1E3
            };
            g.appendChild(b);
            e = document.createTextNode(e);
            b.appendChild(e);
            e = b.offsetHeight;
            b = document.createElement("div");
            b.className = "ammapDescriptionText " + d + "text-div";
            b.style.maxHeight = f.maxHeight - e - 20 + "px";
            g.appendChild(b);
            b.innerHTML = c
        }, close: function () {
            try {
                this.div.parentNode.removeChild(this.div)
            } catch (a) {
            }
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.ValueLegend = d.Class({
        construct: function (a) {
            this.cname = "ValueLegend";
            this.enabled = !0;
            this.showAsGradient = !1;
            this.minValue = 0;
            this.height = 12;
            this.width = 200;
            this.bottom = this.left = 10;
            this.borderColor = "#FFFFFF";
            this.borderAlpha = this.borderThickness = 1;
            this.color = "#000000";
            this.fontSize = 11;
            d.applyTheme(this, a, this.cname)
        }, init: function (a, b) {
            if (this.enabled) {
                var c = a.areasSettings.color, e = a.areasSettings.colorSolid, f = a.colorSteps;
                d.remove(this.set);
                var g = b.set();
                this.set =
                    g;
                d.setCN(a, g, "value-legend");
                var l = 0, h = this.minValue, k = this.fontSize, m = a.fontFamily, q = this.color;
                void 0 == h && (h = a.minValueReal);
                void 0 !== h && (l = d.text(b, h, q, m, k, "left"), l.translate(0, k / 2 - 1), d.setCN(a, l, "value-legend-min-label"), g.push(l), l = l.getBBox().height);
                h = this.maxValue;
                void 0 === h && (h = a.maxValueReal);
                void 0 !== h && (l = d.text(b, h, q, m, k, "right"), l.translate(this.width, k / 2 - 1), d.setCN(a, l, "value-legend-max-label"), g.push(l), l = l.getBBox().height);
                if (this.showAsGradient)c = d.rect(b, this.width, this.height,
                    [c, e], 1, this.borderThickness, this.borderColor, 1, 0, 0), d.setCN(a, c, "value-legend-gradient"), c.translate(0, l), g.push(c); else for (k = this.width / f, m = 0; m < f; m++)q = d.getColorFade(c, e, 1 * m / (f - 1)), q = d.rect(b, k, this.height, q, 1, this.borderThickness, this.borderColor, 1), d.setCN(a, q, "value-legend-color"), d.setCN(a, q, "value-legend-color-" + m), q.translate(k * m, l), g.push(q);
                e = c = 0;
                f = g.getBBox();
                l = a.getY(this.bottom, !0);
                k = a.getY(this.top);
                m = a.getX(this.right, !0);
                q = a.getX(this.left);
                isNaN(k) || (c = k);
                isNaN(l) || (c = l - f.height);
                isNaN(q) || (e = q);
                isNaN(m) || (e = m - f.width);
                g.translate(e, c)
            } else d.remove(this.set)
        }
    })
})();
(function () {
    var d = window.AmCharts;
    d.ObjectList = d.Class({
        construct: function (a) {
            this.divId = a
        }, init: function (a) {
            this.chart = a;
            var b = this.divId;
            this.container && (b = this.container);
            this.div = "object" != typeof b ? document.getElementById(b) : b;
            b = document.createElement("div");
            b.className = "ammapObjectList " + a.classNamePrefix + "-object-list-div";
            this.div.appendChild(b);
            this.addObjects(a.dataProvider, b)
        }, addObjects: function (a, b) {
            var c = this.chart, e = document.createElement("ul");
            e.className = c.classNamePrefix + "-object-list-ul";
            var f;
            if (a.areas)for (f = 0; f < a.areas.length; f++) {
                var d = a.areas[f];
                void 0 === d.showInList && (d.showInList = c.showAreasInList);
                this.addObject(d, e)
            }
            if (a.images)for (f = 0; f < a.images.length; f++)d = a.images[f], void 0 === d.showInList && (d.showInList = c.showImagesInList), this.addObject(d, e);
            if (a.lines)for (f = 0; f < a.lines.length; f++)d = a.lines[f], void 0 === d.showInList && (d.showInList = c.showLinesInList), this.addObject(d, e);
            0 < e.childNodes.length && b.appendChild(e)
        }, addObject: function (a, b) {
            var c = this;
            if (a.showInList && void 0 !==
                a.title) {
                var e = c.chart, d = document.createElement("li");
                d.className = e.classNamePrefix + "-object-list-li";
                var g = document.createTextNode(a.title), l = document.createElement("a");
                l.className = e.classNamePrefix + "-object-list-a";
                l.appendChild(g);
                d.appendChild(l);
                b.appendChild(d);
                this.addObjects(a, d);
                l.onmouseover = function () {
                    c.chart.rollOverMapObject(a, !1)
                };
                l.onmouseout = function () {
                    c.chart.rollOutMapObject(a)
                };
                l.onclick = function () {
                    c.chart.clickMapObject(a)
                }
            }
        }
    })
})();