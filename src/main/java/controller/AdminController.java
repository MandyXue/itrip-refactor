package controller;

import entity.UploadEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.SessionAttributes;
import service.UploadService;

import javax.servlet.http.HttpSession;
import java.util.List;

/**
 * Created by AngelYang on 2015/6/12.
 */
@Controller
@SessionAttributes("userId")
public class AdminController {
    @Autowired
    UploadService uploadService;

    @RequestMapping(value = "/admin",method = RequestMethod.GET)
    public String admin(Model model,HttpSession session){
        if (!session.getAttribute("userId").equals("admin")){
            return "home";
        }
        List<UploadEntity> uploadEntities=uploadService.findAllUploads();
        model.addAttribute("uploadEntities",uploadEntities);

        return "admin";
    }
}
