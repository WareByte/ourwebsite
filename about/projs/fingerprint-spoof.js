(function() {
    'use strict';
    const sessionSeed = sessionStorage.getItem('_fps') || Math.random().toString(36);
    sessionStorage.setItem('_fps', sessionSeed);
    function seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }
    function hashSeed(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return Math.abs(hash);
    }
    const seed = hashSeed(sessionSeed);
    const chromebookProfiles = [
        {
            platform: 'CrOS x86_64 15633.69.0',
            hardwareConcurrency: 4,
            deviceMemory: 4,
            screen: { width: 1366, height: 768, colorDepth: 24 },
            vendor: 'Google Inc.',
            renderer: 'ANGLE (Intel, Intel(R) UHD Graphics 620, OpenGL 4.1)',
            timezone: 'America/New_York'
        },
        {
            platform: 'CrOS x86_64 15633.69.0',
            hardwareConcurrency: 8,
            deviceMemory: 8,
            screen: { width: 1920, height: 1080, colorDepth: 24 },
            vendor: 'Google Inc.',
            renderer: 'ANGLE (Intel, Intel(R) Iris(R) Xe Graphics, OpenGL 4.1)',
            timezone: 'America/Chicago'
        },
        {
            platform: 'CrOS aarch64 15633.69.0',
            hardwareConcurrency: 8,
            deviceMemory: 4,
            screen: { width: 1920, height: 1200, colorDepth: 24 },
            vendor: 'Google Inc.',
            renderer: 'ANGLE (ARM, Mali-G57 MC5, OpenGL ES 3.2)',
            timezone: 'America/Los_Angeles'
        }
    ];
    const profile = chromebookProfiles[Math.floor(seededRandom(seed) * chromebookProfiles.length)];
    Object.defineProperty(Navigator.prototype, 'platform', {
        get: () => profile.platform
    });
    Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
        get: () => profile.hardwareConcurrency
    });
    if ('deviceMemory' in Navigator.prototype) {
        Object.defineProperty(Navigator.prototype, 'deviceMemory', {
            get: () => profile.deviceMemory
        });
    }
    Object.defineProperty(Navigator.prototype, 'vendor', {
        get: () => profile.vendor
    });
    const getParameterProxied = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
        if (parameter === 37445) return profile.vendor;
        if (parameter === 37446) return profile.renderer;
        return getParameterProxied.call(this, parameter);
    };
    if (typeof WebGL2RenderingContext !== 'undefined') {
        const getParameterProxied2 = WebGL2RenderingContext.prototype.getParameter;
        WebGL2RenderingContext.prototype.getParameter = function(parameter) {
            if (parameter === 37445) return profile.vendor;
            if (parameter === 37446) return profile.renderer;
            return getParameterProxied2.call(this, parameter);
        };
    }
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    function addCanvasNoise(canvas) {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.floor(seededRandom(seed + i) * 3) - 1;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
    }
    HTMLCanvasElement.prototype.toDataURL = function(...args) {
        if (this.width > 0 && this.height > 0) {
            addCanvasNoise(this);
        }
        return originalToDataURL.apply(this, args);
    };
    HTMLCanvasElement.prototype.toBlob = function(...args) {
        if (this.width > 0 && this.height > 0) {
            addCanvasNoise(this);
        }
        return originalToBlob.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.getImageData = function(...args) {
        const imageData = originalGetImageData.apply(this, args);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = Math.floor(seededRandom(seed + i) * 3) - 1;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }
        return imageData;
    };
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const AC = window.AudioContext || window.webkitAudioContext;
        const originalCreateOscillator = AC.prototype.createOscillator;
        AC.prototype.createOscillator = function() {
            const oscillator = originalCreateOscillator.call(this);
            const originalStart = oscillator.start;
            oscillator.start = function(when) {
                const variation = seededRandom(seed) * 0.0001;
                return originalStart.call(this, when + variation);
            };
            return oscillator;
        };
    }
    Object.defineProperty(Screen.prototype, 'width', {
        get: () => profile.screen.width
    });
    Object.defineProperty(Screen.prototype, 'height', {
        get: () => profile.screen.height
    });
    Object.defineProperty(Screen.prototype, 'colorDepth', {
        get: () => profile.screen.colorDepth
    });
    Object.defineProperty(Screen.prototype, 'pixelDepth', {
        get: () => profile.screen.colorDepth
    });
    const originalDateTimeFormat = Intl.DateTimeFormat;
    Intl.DateTimeFormat = function(...args) {
        if (args.length === 0 || !args[0]) {
            args[0] = 'en-US';
        }
        if (!args[1]) {
            args[1] = {};
        }
        args[1].timeZone = profile.timezone;
        return new originalDateTimeFormat(...args);
    };
    if (typeof RTCPeerConnection !== 'undefined') {
        const originalRTC = RTCPeerConnection;
        window.RTCPeerConnection = function(...args) {
            if (args[0] && args[0].iceServers) {
                args[0].iceServers = [];
            }
            return new originalRTC(...args);
        };
    }
    const originalOffscreenCanvas = window.OffscreenCanvas;
    if (originalOffscreenCanvas) {
        window.OffscreenCanvas = function(...args) {
            const canvas = new originalOffscreenCanvas(...args);
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const originalMeasureText = ctx.measureText;
                ctx.measureText = function(text) {
                    const metrics = originalMeasureText.call(this, text);
                    const variation = seededRandom(seed) * 0.1;
                    return new Proxy(metrics, {
                        get(target, prop) {
                            if (prop === 'width') {
                                return target[prop] + variation;
                            }
                            return target[prop];
                        }
                    });
                };
            }
            return canvas;
        };
    }
    Object.defineProperty(Navigator.prototype, 'plugins', {
        get: () => {
            return [
                {
                    name: 'Chrome PDF Plugin',
                    filename: 'internal-pdf-viewer',
                    description: 'Portable Document Format'
                },
                {
                    name: 'Chrome PDF Viewer',
                    filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai',
                    description: ''
                },
                {
                    name: 'Native Client',
                    filename: 'internal-nacl-plugin',
                    description: ''
                }
            ];
        }
    });
})();
