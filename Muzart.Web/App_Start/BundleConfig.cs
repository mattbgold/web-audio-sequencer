using System.Web;
using System.Web.Optimization;

namespace Muzart.Web
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/jquery.hotkeys.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/knockout").Include(
                "~/Scripts/knockout-{version}.js",
                "~/Scripts/Muzart/KnockoutInit.js",
                "~/Scripts/Muzart/BindingHandlers.js"
                ));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts/bootstrap.js",
                "~/Scripts/bootbox.js"));

            bundles.Add(new ScriptBundle("~/bundles/muzartcompose").Include(
                "~/Scripts/perfect-scrollbar.jquery.js",
                "~/Scripts/Muzart/SelectionModel.js",
                "~/Scripts/Muzart/SnapZoomGridModel.js",
                "~/Scripts/Muzart/PlayerModel.js",
                "~/Scripts/Muzart/Muzart.js",
                "~/Scripts/Muzart/ComposeModel.js",
                "~/Scripts/Muzart/PianoRollModel.js"));

            bundles.Add(new ScriptBundle("~/bundles/midi").IncludeDirectory(
                "~/Scripts/midi", "*.js", true));



            bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css"));
            bundles.Add(new StyleBundle("~/Content/muzartcompose").Include(
                "~/Content/perfect-scrollbar.css",
                "~/Content/Muzart/Compose.css",
                "~/Content/Muzart/PianoRoll.css"));

            bundles.Add(new StyleBundle("~/Content/bootstrap").Include(
                "~/Content/bootstrap.css", 
                "~/Content/bootstrap-theme.css",
                "~/Content/font-awesome.css"));


            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));
        }
    }
}