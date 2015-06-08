using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace Muzart.Web.Controllers
{
    //TODO: Make this another project - scalability 
    public class MidiController : ApiController
    {
        // GET api/midi
        public IEnumerable<string> Get()
        {
            return _midiFiles.Select(x => new FileInfo(x).Name).ToArray();
        }

        // GET api/midi/5
        public string Get(int id)
        {
            return GetMidiBase64(id);
        }

        // POST api/midi
        public void Post([FromBody]string value)
        {
            throw new NotImplementedException();
        }

        // PUT api/midi/5
        public void Put(int id, [FromBody]string value)
        {
            throw new NotImplementedException();
        }

        // DELETE api/midi/5
        public void Delete(int id)
        {
            throw new NotImplementedException();
        }

        private string GetMidiBase64(int id)
        {
            return Convert.ToBase64String(File.ReadAllBytes(_midiFiles[id]));
        }
        private string[] _midiFiles
        {
            get
            {
                return Directory.GetFiles(HttpContext.Current.Server.MapPath("~/Content/Muzart/midi"));
            }
        }
    }
}
