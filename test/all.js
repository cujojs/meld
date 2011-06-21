// DOH seems to faily consistently on the first test suite, so I'm putting
// in this fake suite so it will fail and all the real tests results will
// be meaningful.
doh.registerUrl('_fake', '../../_fake-doh.html');

// Real tests
doh.registerUrl('before', '../../before.html');
doh.registerUrl('around', '../../around.html');
doh.registerUrl('afterReturning', '../../afterReturning.html');
doh.registerUrl('afterThrowing', '../../afterThrowing.html');
doh.registerUrl('after', '../../after.html');

// Go
doh.run();