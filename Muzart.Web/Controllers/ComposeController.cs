using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Muzart.Web.Controllers
{
    public class ComposeController : Controller
    {
        //
        // GET: /Compose/

        public ViewResult Index()
        {
            return View();
        }

        public PartialViewResult PianoRoll()
        {
            return PartialView("PianoRollComponent");
        }

    }
}
